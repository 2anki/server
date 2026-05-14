import LoginForm from './components/LoginForm';
import { AuthPageBackground } from '../../components/AuthPageBackground';

export function LoginPage() {
  return (
    <AuthPageBackground>
      <LoginForm />
    </AuthPageBackground>
  );
}
