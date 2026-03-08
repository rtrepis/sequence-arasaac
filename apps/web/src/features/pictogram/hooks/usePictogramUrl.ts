import { buildPictogramUrl } from "../api/arasaacClient";

// Hook mínim que exposa buildPictogramUrl com a hook per consistència i facilitat de mock en tests.
const usePictogramUrl = () => ({ buildPictogramUrl });

export default usePictogramUrl;
