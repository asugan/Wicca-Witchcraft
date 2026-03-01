# How to Add Ritual Seed Data

Seed verisi `src/db/ritual-seed-data.ts` içindeki 5 array'de tutulur.
Bu dosya `// AUTO-GENERATED` yorumuyla başlasa da pratikte doğrudan düzenleniyor.

## Array'ler ve Sıraları

```
MATERIAL_SEEDS        → materials tablosu
RITUAL_SEEDS          → rituals tablosu
RITUAL_STEP_SEEDS     → ritual_steps tablosu
RITUAL_MATERIAL_SEEDS → ritual_materials tablosu  ← en sık hata buradan çıkıyor
ENTITY_LINK_SEEDS     → entity_links tablosu
```

Seed sırası `src/db/client.ts:seedIfNeeded()` içinde bu sırayla insert edilir.
Tüm insertlar tek bir transaction içinde olduğu için **herhangi birinde hata olursa
tüm seed geri alınır ve uygulama açılmaz** (spinner sonsuz döner).

---

## Yeni Ritual Eklerken Kontrol Listesi

### 1. RITUAL_SEEDS — ritual ID benzersiz mi?

Her ritual'ın `id` ve `slug` alanı tüm array içinde **tekil** olmalı.
Aynı isimde ama farklı kategoride bir ritual ekleniyorsa suffix kullan:

```ts
// ✗ Yanlış — ikisi de "earth-smoke-bath"
{ id: "earth-smoke-bath", category: "cleansing", ... }
{ id: "earth-smoke-bath", category: "healing", ... }

// ✓ Doğru — kategori suffix ile ayrışıyor
{ id: "earth-smoke-bath", category: "cleansing", ... }
{ id: "earth-smoke-bath-healing", category: "healing", ... }
```

### 2. RITUAL_STEP_SEEDS — step ID benzersiz mi, ritualId var mı?

- Her step'in `id` tüm array içinde tekil olmalı.
- `ritualId` → `RITUAL_SEEDS`'te var olan bir `id` olmalı.

```ts
// ✓ Doğru format
{ id: "my-ritual-step-1", ritualId: "my-ritual", stepOrder: 1, title: "...", content: "..." }
```

### 3. MATERIAL_SEEDS — material ID benzersiz mi?

- Her material'ın `id` ve `slug` tüm array içinde tekil olmalı.
- `linkedEntryId` varsa `library_entries` tablosunda karşılığı olmalı
  (ya `LIBRARY_ENTRY_SEEDS`'te ya da CDN'den gelmiş olmalı).

### 4. RITUAL_MATERIAL_SEEDS — composite key çakışması var mı?

Bu array'de `id` alanı **yoktur**; tablo `(ritual_id, material_id)` çiftini
unique constraint olarak kullanır. Aynı çift iki kez eklenirse constraint ihlali olur.

```ts
// ✗ Yanlış — aynı (ritualId, materialId) çifti iki kez
{ ritualId: "earth-smoke-bath", materialId: "fumitory", sortOrder: 1 }
{ ritualId: "earth-smoke-bath", materialId: "fumitory", sortOrder: 1 }  // HATA

// ✓ Doğru — farklı materialId
{ ritualId: "earth-smoke-bath", materialId: "fumitory",    sortOrder: 1 }
{ ritualId: "earth-smoke-bath", materialId: "spring-water", sortOrder: 2 }
```

- `ritualId` → `RITUAL_SEEDS`'te var olmalı.
- `materialId` → `MATERIAL_SEEDS`'te var olmalı.

---

## Eklemeden Önce Çalıştır

Aşağıdaki script tüm constraint'leri tek seferde kontrol eder.
Proje kökünde çalıştır:

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/db/ritual-seed-data.ts', 'utf8');

function extractIds(arrayName) {
  const section = src.match(new RegExp('export const ' + arrayName + '[^=]*=\\s*\\[[\\s\\S]*?^\\];', 'm'))?.[0] ?? '';
  return [...section.matchAll(/\bid:\s*\"([^\"]+)\"/g)].map(m => m[1]);
}

function findDups(ids) {
  const seen = {}; return ids.filter(id => { const r = seen[id]; seen[id]=true; return r; });
}

// 1. Ritual ID duplicates
const ritDups = findDups(extractIds('RITUAL_SEEDS'));
console.log('Ritual ID dups:', ritDups.length ? ritDups : 'None ✓');

// 2. Step ID duplicates
const stepDups = findDups(extractIds('RITUAL_STEP_SEEDS'));
console.log('Step ID dups:', stepDups.length ? stepDups : 'None ✓');

// 3. Material ID duplicates
const matDups = findDups(extractIds('MATERIAL_SEEDS'));
console.log('Material ID dups:', matDups.length ? matDups : 'None ✓');

// 4. RitualMaterial composite key duplicates
const rmSection = src.match(/export const RITUAL_MATERIAL_SEEDS[^=]*=\s*\[[\s\S]*?^\];/m)?.[0] ?? '';
const pairs = [...rmSection.matchAll(/ritualId:\s*\"([^\"]+)\"[^}]*materialId:\s*\"([^\"]+)\"/g)].map(m => m[1]+'|'+m[2]);
const pairDups = findDups(pairs);
console.log('RitualMaterial pair dups:', pairDups.length ? pairDups : 'None ✓');

// 5. Step ritualId references
const ritIds = new Set(extractIds('RITUAL_SEEDS'));
const stepSection = src.match(/export const RITUAL_STEP_SEEDS[^=]*=\s*\[[\s\S]*?^\];/m)?.[0] ?? '';
const missingRitInSteps = [...new Set([...stepSection.matchAll(/ritualId:\s*\"([^\"]+)\"/g)].map(m=>m[1]))].filter(id=>!ritIds.has(id));
console.log('Steps with unknown ritualId:', missingRitInSteps.length ? missingRitInSteps : 'None ✓');

// 6. RitualMaterial foreign key references
const matIds = new Set(extractIds('MATERIAL_SEEDS'));
const missingRitInRM = [...new Set([...rmSection.matchAll(/ritualId:\s*\"([^\"]+)\"/g)].map(m=>m[1]))].filter(id=>!ritIds.has(id));
const missingMatInRM = [...new Set([...rmSection.matchAll(/materialId:\s*\"([^\"]+)\"/g)].map(m=>m[1]))].filter(id=>!matIds.has(id));
console.log('RM unknown ritualIds:', missingRitInRM.length ? missingRitInRM : 'None ✓');
console.log('RM unknown materialIds:', missingMatInRM.length ? missingMatInRM : 'None ✓');
"
```

Tüm satırlar `None ✓` ile bitiyorsa commit'e hazır.

---

## Sık Yapılan Hatalar

| Hata | Belirti | Neden |
|------|---------|-------|
| Ritual ID duplicate | Uygulama açılmaz, spinner döner | `RITUAL_SEEDS`'te aynı `id` iki kez |
| Step ID duplicate | Uygulama açılmaz | `RITUAL_STEP_SEEDS`'te aynı `id` iki kez |
| RitualMaterial çifti duplicate | Uygulama açılmaz | `RITUAL_MATERIAL_SEEDS`'te aynı `(ritualId, materialId)` iki kez |
| Bilinmeyen `materialId` | Uygulama açılmaz | Material `MATERIAL_SEEDS`'te tanımlı değil |
| Uygulama açılmıyor ama log yok | Spinner sonsuz döner | `DatabaseGate` error state'i göstermiyor, console'a bak |

## Hata Ayıklama

Uygulama açılmıyorsa `src/context/database-context.tsx` catch bloğuna geçici olarak log ekle:

```ts
.catch((e) => {
  const err = e instanceof Error ? e : new Error(String(e));
  console.error("[DB] failed:", err.message);  // ← ekle
  setError(err);
});
```

Metro bundler'ın çıktısında `[DB] failed:` satırı görünür ve hatanın kaynağı anlaşılır.
İşin bittikten sonra bu satırı kaldır.
