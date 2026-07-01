import service from "./service.config"

export function getAllUsers() {
  return service.get("/all-users")
}

export function getAllComments() {
  return service.get("/all-comments")
}

export function deleteComment(commentId) {
  return service.delete(`/comment/${commentId}`)
}
