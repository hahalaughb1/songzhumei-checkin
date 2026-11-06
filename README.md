# 第27屆松竹梅 檢錄看板

- `index.html`：給選手看的頁面，只顯示現在檢錄到哪裡、下兩組和公告，會自動即時更新。
- `staff.html`：檢錄處控制台，要輸入密碼才能用。可以按上一組／下一組、跳到指定組別、發布公告、重設。
- `data.js`：從 `最新秩序冊.pdf` 產生的 36 項、125 組道次資料。
- `config.js`：Firebase 設定，還要再填。
- `database.rules.json`：Firebase 資料庫規則。所有人都能讀，只有檢錄處帳號能寫。

## Firebase 設定（只需做一次）

1. 到 https://console.firebase.google.com 新增專案，Google Analytics 可以不開。
2. **Build → Realtime Database → 建立資料庫**，地區選 `asia-southeast1`（新加坡），先選「鎖定模式」。
3. 打開 **Rules** 分頁，貼上 `database.rules.json` 的內容，把 `STAFF_EMAIL_HERE` 換成下一步的帳號 email，按「發布」。
4. 到 **Build → Authentication → 開始使用 → 電子郵件/密碼**，啟用它。接著在 **Users** 分頁新增一個使用者，例如 `checkin@ncu-swim.tw`，再設定一組密碼。這組密碼就是檢錄處要輸入的密碼。
5. 到 **專案設定（齒輪）→ 一般 → 你的應用程式 → 網頁 `</>`** 註冊應用程式，把 `firebaseConfig` 整段複製到 `config.js`，`STAFF_EMAIL` 填第 4 步的 email。
6. 到 **Authentication → Settings → Authorized domains**，加入 `<GitHub帳號>.github.io`。

## 要換密碼

到 Firebase 的 Authentication → Users，找到那個帳號，選「重設密碼」或直接改密碼。網站的檔案不用改。
