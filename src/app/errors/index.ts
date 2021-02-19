import { CastFilter } from './cast.error';
import { PayloadFilter } from './payload.error';
import { ValidationFilter } from './validation.error';

export default [new ValidationFilter(), new CastFilter(), new PayloadFilter()];
