# How to Add Library Seed Data

Library içerikleri `src/db/library-seed-data.ts` içindeki 3 private array'de tutulur
ve tek bir export ile birleştirilir.

## Yapı

```
HERB_SEEDS    (100 giriş) → bitkiler, reçineler, organikler
CRYSTAL_SEEDS  (50 giriş) → kristaller, taşlar, mineraller, metaller
MISC_SEEDS    (100 giriş) → topraklar, sular, sıvılar, aletler, charmlar, vb.

export const LIBRARY_ENTRY_SEEDS = [...HERB_SEEDS, ...CRYSTAL_SEEDS, ...MISC_SEEDS]
```

Bu export `src/db/client.ts:seedIfNeeded()` içinde insert edilir.
Hata olursa tüm seed transaction'ı geri alınır → uygulama açılmaz.

---

## Yeni Giriş Eklerken Kontrol Listesi

### 1. ID benzersiz mi?

`id` ve `slug` tüm `LIBRARY_ENTRY_SEEDS` içinde (3 array birleşimi) **tekil** olmalı.
Benzer isimli farklı varyantlar için suffix kullan:

```ts
// ✗ Yanlış — iki chamomile aynı ID ile
{ id: "chamomile", ... }
{ id: "chamomile", ... }

// ✓ Doğru — varyant ayrışıyor
{ id: "roman-chamomile", ... }
{ id: "chamomile-german", ... }
```

### 2. entityType geçerli mi?

Yalnızca `LibraryEntrySeed` tipinde tanımlı değerler kullanılabilir:

```
crystal | herb | candle | symbol | deity | stone | mineral |
metal | earth | water | liquid | tool | charm | organic |
amulet | material | animal-product | resin | offering
```

Yeni bir tür gerekiyorsa önce `LibraryEntrySeed` tipini `src/db/library-seed-data.ts`'in
başında güncelle, ardından `src/db/schema.ts`'de de ilgili enum/check'i güncelle
ve `npm run db:generate` çalıştır.

### 3. Hangi array'e eklenmeli?

| Array | Uygun entityType'lar |
|-------|---------------------|
| `HERB_SEEDS` | `herb`, `resin`, `organic`, `animal-product`, `offering` |
| `CRYSTAL_SEEDS` | `crystal`, `stone`, `mineral`, `metal` |
| `MISC_SEEDS` | `earth`, `water`, `liquid`, `tool`, `charm`, `amulet`, `material`, `candle`, `symbol`, `deity` |

Kesin bir kural değil; tutarlılık için mevcut gruba bak.

### 4. `linkedEntryId` referansı doğru mu?

`MATERIAL_SEEDS` içindeki malzemeler bu library entry'lere `linkedEntryId` ile bağlanır.
Bir library entry silinirse bağlı malzemelerin `linkedEntryId` alanı `null` olur
(schema'da `ON DELETE SET NULL` tanımlı).

Library entry eklerken:
- `id` değeri, buna bağlanacak `MATERIAL_SEEDS` kayıtlarının `linkedEntryId` değeriyle eşleşmeli.
- Kaldırırken `MATERIAL_SEEDS`'te o `linkedEntryId`'yi kullanan kayıtlar varsa dikkat et
  (silinmez, sadece `null` olur — işlevsel zarar yok ama link kopar).

---

## Eklemeden Önce Çalıştır

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/db/library-seed-data.ts', 'utf8');

// 1. Duplicate ID kontrolü
const ids = [...src.matchAll(/\bid:\s*\"([^\"]+)\"/g)].map(m => m[1]);
const seen = {};
const dups = ids.filter(id => { const r = seen[id]; seen[id] = true; return r; });
console.log('Duplicate IDs:', dups.length ? dups : 'None ✓');
console.log('Total entries:', ids.length);

// 2. linkedEntryId cross-check (library → materials)
const ritSrc = fs.readFileSync('src/db/ritual-seed-data.ts', 'utf8');
const libIds = new Set(ids);
const linkedRefs = [...ritSrc.matchAll(/linkedEntryId:\s*\"([^\"]+)\"/g)].map(m => m[1]);
const brokenLinks = [...new Set(linkedRefs)].filter(id => !libIds.has(id));
console.log('Broken linkedEntryId refs in MATERIAL_SEEDS:', brokenLinks.length ? brokenLinks : 'None ✓');
"
```

Her satır `None ✓` ile bitiyorsa commit'e hazır.

---

## Sık Yapılan Hatalar

| Hata | Belirti | Neden |
|------|---------|-------|
| ID duplicate | Uygulama açılmaz, spinner döner | Aynı `id` veya `slug` iki kez |
| Geçersiz `entityType` | TypeScript derleme hatası | Schema'da olmayan tür kullanımı |
| Eksik alan | TypeScript derleme hatası | `LibraryEntrySeed` tipinin zorunlu alanı boş |

## Hata Ayıklama

Uygulama açılmıyorsa → bkz. `docs/how-to-ritual-seed.md` → Hata Ayıklama bölümü.
`[DB] failed:` log satırı hatanın tam kaynağını gösterir.
