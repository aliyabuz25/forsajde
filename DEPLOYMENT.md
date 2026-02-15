# Forsaj.az Deployment Guide

## Sistem Bilgileri
- **Domains**: forsaj.az, forsaj.octotech.az
- **Traefik Entrypoint**: web (HTTP)
- **Traefik Host**: 127.0.0.1:8080
- **Docker Network**: edge (external)
- **App Name**: forsaj

## 1. Hazırlık (Sunucuda)

### Dizin Yapısı Oluştur
```bash
mkdir -p /datastore/forsaj/{app,uploads}
```

### Projeyi Sunucuya Aktar
```bash
# Yerel makinede ZIP oluştur
cd /Users/ali_new/Desktop/sitemap
zip -r forsaj.zip . -x "node_modules/*" "forsaj-club-offroad-v3/*" ".git/*"

# Sunucuya kopyala (scp veya başka yöntemle)
scp forsaj.zip user@server:/datastore/forsaj/

# Sunucuda aç
cd /datastore/forsaj
unzip forsaj.zip -d app
```

## 2. Docker Image Build (Sunucuda)

```bash
# Backend image build
docker build -t forsaj-backend:latest -f /datastore/forsaj/app/Dockerfile /datastore/forsaj/app

# Image'i kontrol et
docker images | grep forsaj
```

## 3. Portainer Stack Deploy

### Portainer'a Giriş
1. Portainer web arayüzüne giriş yap
2. **Stacks** menüsüne git
3. **Add stack** butonuna tıkla

### Stack Yapılandırması
- **Name**: forsaj
- **Build method**: Web editor
- **Web editor**: `/datastore/forsaj/app/docker-compose.yml` içeriğini yapıştır

### Stack Deploy
- **Deploy the stack** butonuna tıkla
- Container'ın başladığını kontrol et

## 4. Cloudflare Tunnel Yapılandırması

### Zero Trust Dashboard
1. Cloudflare Zero Trust → **Tunnels** → Tunnel seç
2. **Public Hostnames** sekmesine git

### Domain Yapılandırmaları

#### forsaj.az
- **Subdomain**: (boş bırak)
- **Domain**: forsaj.az
- **Type**: HTTP
- **URL**: 127.0.0.1:8080

#### forsaj.octotech.az
- **Subdomain**: forsaj
- **Domain**: octotech.az
- **Type**: HTTP
- **URL**: 127.0.0.1:8080

## 5. Test

### Container Kontrolü
```bash
docker ps | grep forsaj
```

Beklenen çıktı:
```
forsaj_forsaj-1     forsaj-backend:latest     Up
```

### HTTP Test
```bash
# Frontend test
curl -H "Host: forsaj.az" http://127.0.0.1:8080/

# API test
curl -H "Host: forsaj.az" http://127.0.0.1:8080/api/sitemap

# Upload test
curl -H "Host: forsaj.az" http://127.0.0.1:8080/uploads/
```

### Browser Test
1. **forsaj.az** adresini aç → Ana sayfa görünmeli
2. **forsaj.az/acp** adresini aç → Admin paneli görünmeli
3. **forsaj.octotech.az** adresini aç → Ana sayfa görünmeli
4. **forsaj.octotech.az/acp** adresini aç → Admin paneli görünmeli

## 6. Sorun Giderme

### Container Logları
```bash
docker logs forsaj_forsaj-1
```

### Traefik Logları
```bash
docker logs traefik
```

### DNS Kontrolü
```bash
nslookup forsaj.az
nslookup forsaj.octotech.az
```

### Container Yeniden Başlatma
```bash
docker restart forsaj_forsaj-1
```

## 7. Güncelleme Prosedürü

### Kod Güncellemesi
```bash
# Yeni kodu sunucuya aktar
cd /datastore/forsaj/app
git pull origin main

# Image'i yeniden build et
docker build -t forsaj-backend:latest -f /datastore/forsaj/app/Dockerfile /datastore/forsaj/app

# Portainer'dan stack'i yeniden deploy et
# VEYA basitçe:
docker service update --force forsaj_forsaj
```

## 8. Önemli Notlar

- ✅ Host port açma YOK (her şey Traefik üzerinden)
- ✅ Uploads `/datastore/forsaj/uploads` altında persist edilir
- ✅ `map.json` değişiklikleri `/datastore/forsaj/app/map.json` üzerinde kalıcıdır
- ✅ Her iki domain de aynı uygulamayı gösterir
- ✅ `/acp` route'u admin paneline erişim sağlar

## 9. Güvenlik

### Admin Panel Koruması (Opsiyonel)
Eğer `/acp` route'unu korumak isterseniz, `server.js` içinde basic auth ekleyebilirsiniz:

```javascript
// /acp route'unu koruma
app.get('/acp', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !checkAuth(auth)) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
        return res.status(401).send('Authentication required');
    }
    res.sendFile(path.join(__dirname, 'acp.html'));
});
```
