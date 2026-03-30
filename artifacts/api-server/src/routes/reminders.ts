import { Router, type IRouter, type Request, type Response } from "express";
import { db, remindersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/reminders", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const items = await db
      .select()
      .from(remindersTable)
      .where(eq(remindersTable.userId, req.user.id));

    res.json({
      reminders: items.map(toApiReminder),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list reminders");
    res.status(500).json({ error: "Failed to list reminders" });
  }
});

router.post("/reminders/sync", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { reminders } = req.body as { reminders: any[] };
    if (!Array.isArray(reminders)) {
      res.status(400).json({ error: "reminders must be an array" });
      return;
    }

    for (const r of reminders) {
      await db
        .insert(remindersTable)
        .values({
          id: r.id,
          userId: req.user.id,
          title: r.title,
          notes: r.notes ?? "",
          dateTime: new Date(r.dateTime),
          isCompleted: r.isCompleted ?? false,
          priority: r.priority ?? "medium",
          category: r.category ?? "personal",
          repeatInterval: r.repeatInterval ?? "none",
          isSnoozed: r.isSnoozed ?? false,
          snoozeUntil: r.snoozeUntil ? new Date(r.snoozeUntil) : null,
        })
        .onConflictDoUpdate({
          target: remindersTable.id,
          set: {
            title: r.title,
            notes: r.notes ?? "",
            dateTime: new Date(r.dateTime),
            isCompleted: r.isCompleted ?? false,
            priority: r.priority ?? "medium",
            category: r.category ?? "personal",
            repeatInterval: r.repeatInterval ?? "none",
            isSnoozed: r.isSnoozed ?? false,
            snoozeUntil: r.snoozeUntil ? new Date(r.snoozeUntil) : null,
            updatedAt: new Date(),
          },
        });
    }

    const items = await db
      .select()
      .from(remindersTable)
      .where(eq(remindersTable.userId, req.user.id));

    res.json({ reminders: items.map(toApiReminder) });
  } catch (err) {
    req.log.error({ err }, "Failed to sync reminders");
    res.status(500).json({ error: "Failed to sync reminders" });
  }
});

router.post("/reminders", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const r = req.body;
    const [item] = await db
      .insert(remindersTable)
      .values({
        id: r.id,
        userId: req.user.id,
        title: r.title,
        notes: r.notes ?? "",
        dateTime: new Date(r.dateTime),
        isCompleted: r.isCompleted ?? false,
        priority: r.priority ?? "medium",
        category: r.category ?? "personal",
        repeatInterval: r.repeatInterval ?? "none",
        isSnoozed: r.isSnoozed ?? false,
        snoozeUntil: r.snoozeUntil ? new Date(r.snoozeUntil) : null,
      })
      .returning();
    res.status(201).json({ reminder: toApiReminder(item) });
  } catch (err) {
    req.log.error({ err }, "Failed to create reminder");
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

router.put("/reminders/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { id } = req.params;
    const r = req.body;
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (r.title !== undefined) updateData.title = r.title;
    if (r.notes !== undefined) updateData.notes = r.notes;
    if (r.dateTime !== undefined) updateData.dateTime = new Date(r.dateTime);
    if (r.isCompleted !== undefined) updateData.isCompleted = r.isCompleted;
    if (r.priority !== undefined) updateData.priority = r.priority;
    if (r.category !== undefined) updateData.category = r.category;
    if (r.repeatInterval !== undefined) updateData.repeatInterval = r.repeatInterval;
    if (r.isSnoozed !== undefined) updateData.isSnoozed = r.isSnoozed;
    if (r.snoozeUntil !== undefined) updateData.snoozeUntil = r.snoozeUntil ? new Date(r.snoozeUntil) : null;

    const [item] = await db
      .update(remindersTable)
      .set(updateData)
      .where(and(eq(remindersTable.id, id), eq(remindersTable.userId, req.user.id)))
      .returning();

    if (!item) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    res.json({ reminder: toApiReminder(item) });
  } catch (err) {
    req.log.error({ err }, "Failed to update reminder");
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

router.delete("/reminders/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { id } = req.params;
    await db
      .delete(remindersTable)
      .where(and(eq(remindersTable.id, id), eq(remindersTable.userId, req.user.id)));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete reminder");
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

function toApiReminder(item: any) {
  return {
    id: item.id,
    title: item.title,
    notes: item.notes ?? "",
    dateTime: item.dateTime instanceof Date ? item.dateTime.toISOString() : item.dateTime,
    isCompleted: item.isCompleted,
    priority: item.priority,
    category: item.category,
    repeatInterval: item.repeatInterval,
    isSnoozed: item.isSnoozed,
    snoozeUntil: item.snoozeUntil instanceof Date ? item.snoozeUntil.toISOString() : item.snoozeUntil ?? null,
    notificationId: null,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
  };
}

export default router;
