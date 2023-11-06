export const handleError = (error: unknown): { statusCode: number; body: string } => {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error has occurred';
  console.error(errorMessage);

  return {
    statusCode: 500,
    body: JSON.stringify({ message: errorMessage })
  };
};
