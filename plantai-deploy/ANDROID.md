# 📱 PlantAI Android апп

Вэб апп-ын React кодыг [Capacitor 8](https://capacitorjs.com)-аар ороож Android апп болгосон.
Нэг код — вэб болон апп хоёуланд ажиллана.

## Хэрхэн ажилладаг вэ

| | Вэб (plant-ai-five.vercel.app) | Android апп |
|---|---|---|
| UI код | `src/` | `src/` (build хийхэд `android/` руу хуулагдана) |
| API | ижил домэйн `/api/...` | `https://plant-ai-five.vercel.app/api/...` ([src/platform.js](src/platform.js)) |
| Нэвтрэлт | HttpOnly cookie | Bearer токен (30 хоног), утсан дотор хадгална |
| Premium/VIP худалдан авалт | банкны шилжүүлэг | **харуулахгүй** (доорх «Төлбөрийн бодлого»-г үз) |

- **Сервер (`api/`) өөрчлөгдөхөд апп-ыг дахин гаргах шаардлагагүй** — Vercel-д deploy хийхэд л хангалттай.
- **UI (`src/`) өөрчлөгдөхөд** апп-ыг дахин build хийж, Play Store-д шинэ хувилбар оруулна.
- Лавлах (өвчин/шавж/хог ургамал), хуанли, түүх интернэтгүй ажиллана. AI оношлогоо интернэт шаардана.

## Өдөр тутмын команд

```powershell
npm run android:apk     # debug APK → android/app/build/outputs/apk/debug/app-debug.apk
npm run android:aab     # Play Store-д оруулах AAB → android/app/build/outputs/bundle/release/app-release.aab
npm run android:sync    # зөвхөн вэб файлуудыг android/ руу хуулна
```

Утсан дээр турших: утасны **Тохиргоо → Утасны тухай → Build number** дээр 7 удаа дарж
Developer options нээгээд **USB debugging** асаана. Утсаа USB-ээр холбоод:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r android\app\build\outputs\apk\debug\app-debug.apk
```

Эсвэл APK файлыг утас руу (Telegram, кабель) хуулж нээгээд «Тодорхойгүй эх сурвалжаас суулгах»-ыг зөвшөөрнө.

### Энэ компьютерт суусан хэрэгслүүд

- JDK 21: `%USERPROFILE%\.jdks\jdk-21.0.13.1+2` — Gradle үүнийг `%USERPROFILE%\.gradle\gradle.properties`-ээр ашиглана (системийн Java 8-д нөлөөгүй)
- Android SDK: `%LOCALAPPDATA%\Android\Sdk` (`android/local.properties`-д заасан)
- Өөр компьютер дээр: [Android Studio](https://developer.android.com/studio) суулгахад хоёулаа хамт ирнэ.

## Play Store-д гаргах

### 1. Google Play Console бүртгэл
- <https://play.google.com/console> — нэг удаагийн **$25** төлбөр, иргэний үнэмлэхээр баталгаажуулна.
- ⚠️ **Шинэ хувь хүний бүртгэл** бол production-д гаргахаас өмнө **12+ тестертэй 14 хоногийн closed testing** заавал хийх ёстой. Тестерүүдийн Gmail хаягийг цуглуулж эхлээрэй (найз, тариаланч хэрэглэгчид).
- Байгууллагын (компанийн) бүртгэлд энэ шаардлага байхгүй, гэхдээ D-U-N-S дугаар хэрэгтэй.

### 2. Upload түлхүүр үүсгэх (НЭГ УДАА)

```powershell
& "$env:USERPROFILE\.jdks\jdk-21.0.13.1+2\bin\keytool.exe" -genkeypair -v -keystore android\plantai-upload.jks -alias plantai -keyalg RSA -keysize 2048 -validity 10000
```

Дараа нь `android/keystore.properties` файл үүсгэнэ (git-д ордоггүй):

```properties
storeFile=../plantai-upload.jks
storePassword=ТАНЫ_НУУЦ_ҮГ
keyAlias=plantai
keyPassword=ТАНЫ_НУУЦ_ҮГ
```

> 🔐 `plantai-upload.jks` болон нууц үгээ **заавал нөөцөл** (Google Drive, флаш). Алдвал Play Console-оос
> upload key солих хүсэлт гаргах шаардлагатай болно. Энэ файлыг хэзээ ч git/GitHub руу бүү оруул.

### 3. AAB build хийх

```powershell
npm run android:aab
```

Шинэ хувилбар оруулах бүрд [android/app/build.gradle](android/app/build.gradle)-ийн `versionCode`-г 1-ээр
нэмэгдүүлж, `versionName`-ийг (жишээ нь `1.0.1`) шинэчилнэ.

### 4. Play Console дээр апп үүсгэх
**Create app** → нэр `PlantAI`, хэл **Монгол (mn-MN)**, App, Free.

**App content** хэсэг:

| Асуулт | Хариулт |
|---|---|
| Privacy policy | `https://plant-ai-five.vercel.app/privacy.html` |
| App access | «All or some functionality is restricted» → шалгагчид **тест бүртгэл** (и-мэйл + нууц үг) өгнө. VIP эрхтэй бол бүх боломж харагдана |
| Ads | No |
| Content rating | Асуулгыг бөглөнө (хүчирхийлэл гэх мэт байхгүй → Everyone) |
| Target audience | 18+ |
| Data safety | доорх хүснэгт |
| Account deletion URL | `https://plant-ai-five.vercel.app/privacy.html#delete` |
| Government / Financial / Health apps | No |

**Data safety** хариулт:

| Өгөгдөл | Цуглуулдаг | Хуваалцдаг | Зорилго | Тэмдэглэл |
|---|---|---|---|---|
| Personal info → Name | Тийм | Үгүй | Account management | Заавал |
| Personal info → Email address | Тийм | Үгүй | Account management | Заавал |
| Financial info → Purchase history | Тийм | Үгүй | Account management | Premium/VIP эрхийн төлөв |
| Photos and videos → Photos | Тийм | Үгүй* | App functionality | «Processed ephemerally» ✓, хэрэглэгч сонголтоор |
| App activity → Other user-generated content | Тийм | Үгүй* | App functionality | AI зөвлөхийн асуулт, «processed ephemerally» ✓ |

\* Anthropic (AI) нь таны нэрийн өмнөөс өгөгдөл боловсруулдаг **service provider** тул Play-ийн
тодорхойлолтоор «sharing» биш. Encrypted in transit: **Тийм**. Users can request deletion: **Тийм**.

### 5. Store listing
- **App icon** 512×512: [public/icons/icon-512.png](public/icons/icon-512.png)
- **Feature graphic** 1024×500: [store/feature-graphic.png](store/feature-graphic.png)
- **Phone screenshots** (2–8 ширхэг): [store/](store/) хавтаст бэлэн дэлгэцийн зургууд бий. Бодит оношлогооны үр дүнгийн зураг нэмбэл илүү үр дүнтэй.
- **Short description** (80 тэмдэгт хүртэл):
  `Ургамлын өвчин, хортон шавж, хог ургамлыг зургаар 10 секундэд таниулах AI туслах`
- **Full description** — жишээ:

  > PlantAI — Монголын тариаланчдын AI туслах. Ургамлын өвчилсөн навч, иш, булцууны зургийг авахад
  > хиймэл оюун 10 секундэд өвчнийг оношилж, хэрхэн эмчлэх, урьдчилан сэргийлэхийг Монгол хэлээр зөвлөнө.
  >
  > 🔬 Ургамлын өвчин оношлогоо — 19 таримлын 79+ өвчин
  > 🌍 Хөрсний шинжилгээ — хөрсний төрөл, тохирох таримал, бордооны зөвлөмж
  > 🍃 Хог ургамал таних — гербицид, тун, тэмцэх арга
  > 🐛 Хортон шавж таних — 43+ хортон шавжийн лавлах
  > 💬 AI агрономч зөвлөх — тариалалт, бордоо, усалгааны асуултад хариулна
  > 🌤 Тариалалтын хуанли — Монголын богино улиралд тохирсон
  > 📚 Интернэтгүй ажилладаг өвчин, шавж, хог ургамлын лавлах

### 6. Гаргах
1. **Testing → Closed testing** → track үүсгэж, тестерүүдийн Gmail-ийг нэмээд AAB-аа оруулна.
2. 14 хоногийн дараа (12+ тестер идэвхтэй байсан бол) **Production**-д хүсэлт гаргана.
3. Google шалгалт ихэвчлэн 1–7 хоног.

## Төлбөрийн бодлого (чухал)

Google Play нь апп дотор **дижитал эрх/захиалга** (Premium, VIP) зарахад **Google Play Billing**-ийг заавал
ашиглахыг шаарддаг. Банкны шилжүүлэг рүү чиглүүлэх товч, холбоос, үнийн мэдээлэл апп дотор байвал апп
татгалзагдах эсвэл хасагдах эрсдэлтэй. Тиймээс апп дотор:

- үнийн цонх, «Эрх авах» CTA, банкны шилжүүлгийн урсгал **нуугдсан** (`isNative` шалгалт, [src/PlantAI.jsx](src/PlantAI.jsx));
- вэбээр эрх авсан хэрэглэгч апп-д нэвтрэхэд эрх нь автоматаар идэвхжинэ.

Апп дотор шууд зарах бол дараагийн алхам нь Google Play Billing холбох (жишээ нь RevenueCat) — Google
захиалгаас 15% шимтгэл авна.

## iPhone (iOS)

Код бэлэн (`npx cap add ios`), гэхдээ **Mac компьютер + Xcode** ба **Apple Developer** бүртгэл ($99/жил)
шаардлагатай. Apple мөн апп доторх дижитал худалдаанд In-App Purchase шаарддаг.
Түр зуур: iPhone хэрэглэгчид Safari-аар сайтыг нээж **Share → Add to Home Screen** дарж апп шиг суулгана.
