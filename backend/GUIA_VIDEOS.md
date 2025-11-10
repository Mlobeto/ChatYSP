# 🎥 Importar Videos del Coach - Guía Simple

## ✅ Todo Listo

- ✅ Neon configurado con pgvector
- ✅ 13 tablas creadas
- ✅ Sistema de embeddings funcionando
- ✅ Integración con Daily Tips activa

---

## 📋 Solo 2 Pasos

### 1️⃣ Llenar youtube_videos.json

Edita: `backend/data/youtube_videos.json`

```json
{
  "metadata": {
    "totalVideos": 500,
    "lastUpdated": "2024-11-09"
  },
  "videos": [
    {
      "id": "1",
      "title": "Cómo Alcanzar Tus Metas",
      "url": "https://youtube.com/watch?v=ABC123",
      "category": "Bienestar",
      "tags": ["motivación", "metas"],
      "duration": 720,
      "publishedAt": "2024-01-15",
      "description": "En este video exploramos...",
      "summary": "Define tu visión, crea un plan, toma acción",
      "keyPoints": [
        "Define claramente tu visión",
        "Establece metas SMART"
      ]
    }
    // ... más videos
  ]
}
```

### 2️⃣ Importar

```bash
cd C:/Users/merce/Desktop/ChatYSP/backend
node scripts/importYouTubeVideos.js --file data/youtube_videos.json
```

**Tiempo:** ~25-30 min para 500 videos  
**Costo:** ~$0.005 USD

---

## 🎯 Resultado

Los Daily Tips automáticamente incluirán videos (30% de probabilidad):

```
💡 Tip del Día

[Contenido del tip...]

📺 Video relacionado:
🎥 Título del Video
🔗 https://youtube.com/...
⏱️ 12 min
```

---

## 📚 Documentación Completa

- `VIDEO_EMBEDDINGS_GUIDE.md` - Detalles técnicos
- `SETUP_COMPLETO.md` - Setup paso a paso

¡Eso es todo! 🎉
