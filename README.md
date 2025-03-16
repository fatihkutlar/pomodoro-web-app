# Pomodoro Web Sitesi

Bu proje, Pomodoro tekniğini uygulamak için kullanılan bir web uygulamasıdır. Kullanıcılar çalışma ve mola sürelerini takip edebilir, görevlerini yönetebilir ve istatistiklerini görüntüleyebilirler.

## Özellikler

- 🕒 Ayarlanabilir çalışma ve mola süreleri
- 📋 Görev yönetimi ve takibi
- 📊 Çalışma istatistikleri
- 🔔 Sesli bildirimler
- 🎨 Özelleştirilebilir temalar
- 📱 Mobil uyumlu tasarım

## Kullanım

Uygulamayı başlatmak için ana dizinde şu komutu çalıştırın:

```bash
# HTML dosyasını doğrudan tarayıcıda açma
open index.html

# Veya bir yerel sunucu kullanarak
npx serve
```

## Proje Yapısı

- `index.html` - Ana HTML dosyası
- `script.js` - Ana JavaScript kodu
- `styles.css` - Ana stil dosyası
- `js/` - JavaScript modülleri
  - `timer.js` - Zamanlayıcı işlevselliği
  - `tasks.js` - Görev yönetimi
  - `settings.js` - Kullanıcı ayarları
  - `statistics.js` - İstatistik takibi
  - `storage.js` - Yerel depolama yönetimi
- `css/` - Stil dosyaları
  - `themes/` - Tema stilleri
  - `responsive/` - Duyarlı tasarım stilleri
- `assets/` - Medya dosyaları
  - `icons/` - Simge dosyaları
  - `sounds/` - Ses dosyaları
  - `fonts/` - Font dosyaları

## GitHub MCP Entegrasyonu

Bu projede GitHub API'sini kullanmak için Claude yapay zekası ile MCP (Model Context Protocol) entegrasyonu kullanılmıştır. Bu entegrasyon, proje kaynak kodunu GitHub'da yönetmeyi ve Pomodoro uygulamasıyla ilgili repository'leri aramayı kolaylaştırır.

### GitHub MCP Sunucusu

GitHub MCP sunucusu, aşağıdaki işlevleri sağlar:

- Repository arama
- Dosya içeriği görüntüleme
- Repository oluşturma ve yönetme
- Issue/PR yönetimi
- Branch yönetimi
- GitHub code search

### Kurulum

GitHub MCP sunucusunu Cursor uygulaması için kurmak için:

1. GitHub'dan bir Kişisel Erişim Belirteci (PAT) alın
2. Cursor'un MCP ayarlar dosyasına GitHub sunucusunu ekleyin:
   ```json
   "github.com/modelcontextprotocol/servers/tree/main/src/github": {
     "command": "cmd",
     "args": [
       "/c",
       "npx",
       "-y",
       "@modelcontextprotocol/server-github"
     ],
     "env": {
       "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_PAT_HERE"
     },
     "disabled": false,
     "autoApprove": []
   }
   ```

### Kullanım Örnekleri

- Repository arama: `search_repositories` aracıyla belirli kriterlere göre repo arama
- Dosya içeriği görüntüleme: `get_file_contents` aracıyla herhangi bir GitHub reposundan dosya içeriği alma
- Repo oluşturma: `create_repository` aracıyla yeni bir GitHub reposu oluşturma
- Issue açma: `create_issue` aracıyla mevcut bir repoda issue oluşturma

## Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.