export const setHttpPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse({ response }) {
        if (response.body.kind === 'single') {
          response.http.status =
            response.body.singleResult.errors?.[0].statusCode;
        }
      },
    };
  },
};
