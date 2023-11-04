class ExceptionHelper {
    argumentNullMessage(param: string) {
        const message = 'Invalid @param is nill or empty.';
        if (param.isNilOrEmpty()) return message;
        return `${message} [${param}]`;
    }
}

export const excHelper = new ExceptionHelper();