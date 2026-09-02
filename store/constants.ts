export const { FIRECRAWL_API_KEY, TELEGRAM_BOT_TOKEN, GROQ_API_KEY } =
  process.env;

export const messages = {
  start: {
    it:
      `🌤️ *Benvenuto in Weather Research Agent!*\n\n` +
      `Sono il tuo assistente AI per le informazioni e previsioni meteorologiche in tempo reale.\n\n` +
      `💡 *Come usarmi:*\n` +
      `• Scrivi una città e la data (es: "Che tempo fa a Roma domani?")\n` +
      `• *Consiglio:* Per città piccole aggiungi il paese (es: "Lucca, Italia")\n` +
      `• Inviami un *messaggio vocale* spiegando cosa vuoi sapere!\n\n` +
      `⚠️ *Nota:* Non mantengo lo storico delle conversazioni. Includi sempre la città nei tuoi messaggi.`,
    es:
      `🌤️ *¡Bienvenido a Weather Research Agent!*\n\n` +
      `Soy tu asistente de IA para información y pronósticos meteorológicos en tiempo real.\n\n` +
      `💡 *Cómo usarme:*\n` +
      `• Escribe una ciudad y fecha (ej: "¿Qué tiempo hará en Madrid mañana?")\n` +
      `• *Consejo:* Para ciudades pequeñas añade el país (ej: "Lucca, Italia")\n` +
      `• ¡Envíame un *mensaje de voz* explicando qué te gustaría saber!\n\n` +
      `⚠️ *Nota:* No guardo el historial de conversación. Incluye siempre la ubicación en tus mensajes.`,
    en:
      `🌤️ *Welcome to Weather Research Agent!*\n\n` +
      `I am your AI assistant for real-time weather information and forecasts.\n\n` +
      `💡 *How to use me:*\n` +
      `• Type a location and date (e.g., "What's the weather in London tomorrow?")\n` +
      `• *Tip:* For smaller towns, include the country (e.g., "Lucca, Italy")\n` +
      `• Send me a *voice message* asking what you'd like to know!\n\n` +
      `⚠️ *Note:* I do not keep chat history. Always mention the location in your messages.`,
  },
  help: {
    it: "Per ottenere le previsioni, indicami semplicemente una località (meglio se con il paese, es: 'Meteo Lucca, Italia questo weekend'). Puoi anche inviarmi una nota vocale!",
    es: "Para obtener el pronóstico, simplemente dime una ubicación (mejor si incluyes el país, ej: 'Tiempo en Lucca, Italia este fin de semana'). ¡También puedes enviarme una nota de voz!",
    en: "To get the forecast, simply tell me a location (preferably with the country, e.g., 'Weather in Lucca, Italy this weekend'). You can also send a voice message!",
  },
};
