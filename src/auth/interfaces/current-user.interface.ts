import { SafeUser } from '../../user/user-response';

export interface CurrentUser extends SafeUser {
  sub: string;
}
