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

    return _result.join(",");
  };

  return {
    onGetValidateError,
  };
};
