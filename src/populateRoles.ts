import * as db from "zapatos/db";
import { pool } from "./utils/pool";
import { RoleChange } from "./zod";

export const handleRoleGranted = async (roleGranted: RoleChange) => {
  const role = roleGranted.role;
  const isAdminRole = role === "ADMIN";
  const isMemberRole = role === "MEMBER";
  const isModeratorRole = role === "MODERATOR";

  if (isAdminRole) {
    db.insert("space_admins", {
      space_id: roleGranted.space,
      account_id: roleGranted.account,
    }).run(pool);
  } else if (isMemberRole) {
    db.insert("space_editors", {
      space_id: roleGranted.space,
      account_id: roleGranted.account,
    }).run(pool);
  } else if (isModeratorRole) {
    db.insert("space_editor_controllers", {
      space_id: roleGranted.space,
      account_id: roleGranted.account,
    }).run(pool);
  } else {
    console.error("Unknown granted role:", role);
  }
};

export const handleRoleRevoked = async (roleRevoked: RoleChange) => {
  const role = roleRevoked.role;
  const isAdminRole = role === "ADMIN";
  const isMemberRole = role === "MEMBER";
  const isModeratorRole = role === "MODERATOR";

  if (isAdminRole) {
    db.deletes("space_admins", {
      space_id: roleRevoked.space,
      account_id: roleRevoked.account,
    }).run(pool);
  } else if (isMemberRole) {
    db.deletes("space_editors", {
      space_id: roleRevoked.space,
      account_id: roleRevoked.account,
    }).run(pool);
  } else if (isModeratorRole) {
    db.deletes("space_editor_controllers", {
      space_id: roleRevoked.space,
      account_id: roleRevoked.account,
    }).run(pool);
  } else {
    console.error("Unknown revoked role:", role);
  }
};
