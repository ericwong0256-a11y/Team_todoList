const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@todoapp.dev" },
    update: {},
    create: {
      email: "admin@todoapp.dev",
      name: "Admin User",
      passwordHash
    }
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "core-team" },
    update: {},
    create: {
      name: "Core Team",
      slug: "core-team"
    }
  });

  await prisma.membership.upsert({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId: workspace.id }
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: "ADMIN"
    }
  });

  const columns = [
    { title: "To Do", status: "TODO", position: 0 },
    { title: "In Progress", status: "IN_PROGRESS", position: 1 },
    { title: "Review", status: "REVIEW", position: 2 },
    { title: "Done", status: "DONE", position: 3 }
  ];

  for (const column of columns) {
    await prisma.boardColumn.upsert({
      where: { workspaceId_status: { workspaceId: workspace.id, status: column.status } },
      update: { title: column.title, position: column.position },
      create: { ...column, workspaceId: workspace.id }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
