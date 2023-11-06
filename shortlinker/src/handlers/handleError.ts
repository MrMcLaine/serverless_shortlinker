function handleError(error: unknown): Response {
  if (error instanceof Error) {
    console.error(error);
    return Response.json({ error: error.message });
  }
  console.error("Unknown error:", error);
  return Response.json({ error: "Unknown error occurred." });
}

export { handleError };
