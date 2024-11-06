export const emailTemplate = (code: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
    <h2 style="color: #333;">Добро пожаловать!</h2>
    <p style="font-size: 16px; color: #555;">
      Спасибо за регистрацию! Пожалуйста, подтвердите свою электронную почту, используя код ниже.
    </p>
    <p style="font-size: 24px; font-weight: bold; color: #007bff;">
      Ваш код подтверждения: <span style="color: #ff6600;">${code}</span>
    </p>
    <p style="font-size: 14px; color: #888;">
      Если вы не запрашивали регистрацию, пожалуйста, проигнорируйте это письмо.
    </p>
    <p style="font-size: 14px; color: #888;">
      С уважением,<br />Команда поддержки
    </p>
  </div>
`;
