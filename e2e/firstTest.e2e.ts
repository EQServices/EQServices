/**
 * Teste E2E básico - Primeiro teste
 * 
 * Este é um exemplo de teste E2E usando Detox.
 * Para executar:
 * - iOS: detox test --configuration ios.sim.debug
 * - Android: detox test --configuration android.emu.debug
 */

describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('deve mostrar tela de login ao iniciar', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('deve permitir navegar para registro', async () => {
    await element(by.id('register-button')).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });
});

describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('deve fazer login com credenciais válidas', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    
    // Aguardar navegação
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});

