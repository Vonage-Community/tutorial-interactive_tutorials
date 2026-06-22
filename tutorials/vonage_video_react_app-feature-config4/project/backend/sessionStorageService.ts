import isVcr from './middleware/isVcr';
import InMemorySessionStorage from './storage/inMemorySessionStorage';
import { SessionStorage } from './storage/sessionStorage';
import VcrSessionStorage from './storage/vcrSessionStorage';

// Session storage strategy based on whether you use Vonage Cloud Runtime for hosting or run the app locally

const getSessionStorageService = (): SessionStorage => {
  if (isVcr) {
    return new VcrSessionStorage();
  }
  return new InMemorySessionStorage();
};

export default getSessionStorageService;
