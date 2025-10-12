import { Favorite } from "../../contracts/account/favorites";

export async function addFavorite(
  userId: string,
  entityType: "service" | "vendor",
  entityId: string
): Promise<Favorite> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  // TODO: Implement
  throw new Error("Not implemented");
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
  // TODO: Implement
  throw new Error("Not implemented");
}
