import service from "./service.config"

export function getAllUsers() {
  return service.get("/all-users")
}

export function getAllComments() {
  return service.get("/all-comments")
}

export function warnUser(userId) {
  return service.put(`/user/${userId}/warn`)
}

export function deleteUser(userId) {
  return service.delete(`/user/${userId}`)
}

export function deleteComment(commentId) {
  return service.delete(`/comment/${commentId}`)
}
