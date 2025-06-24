/*
export const getItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (e: any) {
    const error = new Error(e.message); //Sample error handling
    (error as any).status = 500;
    return next(error);
  }
};
 */