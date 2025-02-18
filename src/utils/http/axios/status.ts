export const showMessage = (status: number | string): string => {
  let message = "";
  switch (status) {
    case 400:
      message = "Неверный запрос(400)";
      break;
    case 401:
      message = "Неавторизированный запрос(401)";
      break;
    case 403:
      message = "В доступе отказано(403)";
      break;
    case 404:
      message = "Ресурс не найден(404)";
      break;
    case 408:
      message = "Превышено время ожидания(408)";
      break;
    case 500:
      message = "Ошибка сервера(500)";
      break;
    case 501:
      message = "Услуга не реализована(501)";
      break;
    case 502:
      message = "Плохой шлюз(502)";
      break;
    case 503:
      message = "Сервис не доступен(503)";
      break;
    case 504:
      message = "Таймаут сети(504)";
      break;
    case 505:
      message = "HTTP время не поддерживается(505)";
      break;
    default:
      message = `Ошибка соединения(${status})!`;
  }
  return `${message} Пожалуйста, проверьте интернет или свяжитесь с администратором！`;
};
