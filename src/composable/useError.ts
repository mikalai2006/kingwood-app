import { useAppErrorStore, useAuthStore } from "@/store";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";

export interface IFailedFinishForm extends IValidateError {
  values: { [key: string]: any };
  outOfDate: boolean;
}

export interface IValidateError extends Error {
  errorFields: [
    {
      name: string;
      errors: string[];
      warnings: [];
    }
  ];
}

export const useError = () => {
  const appErrorStore = useAppErrorStore();
  const authStore = useAuthStore();

  const { t } = useI18n();

  const onGetValidateError = (
    error: IValidateError,
    countViewError: number = 1
  ) => {
    const _allErrors = error.errorFields.map((x) =>
      x.errors.map((y) => y).join(", ")
    );

    let _result = [];
    if (countViewError !== 1) {
      _result = _allErrors;
    } else {
      _result = _allErrors.slice(0, countViewError);
    }

    const result = _result.join(",");

    message.warning(result);

    return result;
  };

  // const onCreateError = (error: any) => {
  //   if (error.errorFields) {
  //     const err = onGetValidateError(error);
  //     onShowError(err);
  //   } else {
  //     onShowError(error.message);
  //   }
  // };

  const onShowError = (err: any) => {
    // code: string = "", stack: string = ""
    console.log("onShowError: ", err, typeof err);

    if (authStore.iam?.id) {
      appErrorStore.create({
        error: err?.message || err,
        stack: err.stack,
        code: err?.code?.toString(),
      });
    }

    message.error(t(err?.message || err));
  };

  return {
    // onCreateError,
    onGetValidateError,
    onShowError,
  };
};
