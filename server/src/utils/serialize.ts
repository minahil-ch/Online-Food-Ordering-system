import { Document } from 'mongoose';

/** Convert Mongoose document to plain object with `id` instead of `_id` */
export function toJSON<T extends Document>(doc: T): Record<string, unknown> {
  const obj = doc.toObject();
  const { _id, __v, passwordHash, ...rest } = obj as Record<string, unknown>;
  return {
    id: String(_id),
    ...rest,
  };
}

export function formatUser(doc: Document) {
  const json = toJSON(doc);
  delete json.passwordHash;
  return json;
}
