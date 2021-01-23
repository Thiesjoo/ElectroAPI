import { CastFilter } from './cast.error';
import { ValidationFilter } from './validation.error';

export default [new ValidationFilter(), new CastFilter()];
