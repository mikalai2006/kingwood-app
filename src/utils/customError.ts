class CustomError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message); // Call the parent Error constructor
    this.name = "CustomError"; // Set the name of the custom error
    this.code = code; // Add the custom code property
  }
}

export { CustomError };
