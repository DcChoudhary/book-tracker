export interface BookParams {
  title: string,
  author: string,
  status: string,
  rating: number,
}

export interface Book extends BookParams {
  id: bigint,
}

export type DeleteBookFn = (id: Book) => Promise<void>
export type EditBookFn = (id: Book) => Promise<void>
export type CreateBookFn = (book: BookParams) => Promise<void>