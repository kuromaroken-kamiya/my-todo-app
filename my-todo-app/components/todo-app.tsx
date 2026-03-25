"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";

// ---- 型定義 ----

type User = {
  id: string;
  name: string;
  email: string;
};

type Comment = {
  id: number;
  text: string;
  authorName: string;
};

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  userId: string;
  comments: Comment[];
};

// ---- ログイン画面 ----

function LoginScreen({
  users,
  onLogin,
  onShowRegister,
}: {
  users: User[];
  onLogin: (user: User) => void;
  onShowRegister: () => void;
}) {
  const [selectedId, setSelectedId] = useState(users[0]?.id ?? "");

  useEffect(() => {
    if (users.length > 0 && !selectedId) setSelectedId(users[0].id);
  }, [users, selectedId]);

  const handleLogin = () => {
    const user = users.find((u) => u.id === selectedId);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kanban Board</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">ログインしてください</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ユーザーを選択</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}（{user.email}）
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLogin}
            disabled={!selectedId}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
          >
            ログイン
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <button
            onClick={onShowRegister}
            className="w-full py-2.5 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm"
          >
            新規登録
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- 新規登録画面 ----

function RegisterScreen({
  onRegister,
  onBack,
}: {
  onRegister: (name: string, email: string) => Promise<string | null>;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("名前を入力してください"); return; }
    if (!email.trim()) { setError("メールアドレスを入力してください"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("正しいメールアドレスを入力してください"); return; }
    setLoading(true);
    const err = await onRegister(name.trim(), email.trim());
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">新規登録</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">アカウントを作成してください</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="例：鈴木一郎"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="例：suzuki@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
          >
            {loading ? "登録中..." : "登録してログイン"}
          </button>
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-center transition-colors"
          >
            ← ログイン画面に戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- カンバンボード：カード ----

function TodoCard({
  todo,
  onToggle,
  onDelete,
  onAddComment,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAddComment: (todoId: number, text: string) => void;
}) {
  const [commentInput, setCommentInput] = useState("");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };

  const handleAddComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    onAddComment(todo.id, trimmed);
    setCommentInput("");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex flex-col rounded-xl border shadow-sm bg-white dark:bg-gray-800 select-none ${
        todo.completed ? "border-green-100 dark:border-green-900" : "border-gray-100 dark:border-gray-700"
      }`}
    >
      <div className="flex items-start gap-3 p-4 cursor-grab active:cursor-grabbing">
        <div {...listeners} {...attributes} className="mt-0.5 flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" /><circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" />
          </svg>
        </div>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="mt-0.5 w-4 h-4 accent-green-500 cursor-pointer flex-shrink-0"
        />
        <span className={`flex-1 text-sm leading-relaxed ${todo.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-200"}`}>
          {todo.text}
        </span>
        <button
          onClick={() => onDelete(todo.id)}
          className="flex-shrink-0 mt-0.5 text-gray-200 hover:text-red-400 dark:text-gray-700 dark:hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="削除"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl px-4 py-3 flex flex-col gap-2">
        {todo.comments.length === 0 ? (
          <p className="text-xs text-gray-300 dark:text-gray-600 italic">コメントはありません</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {todo.comments.map((comment) => (
              <li key={comment.id} className="flex flex-col gap-0.5 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700">
                <span className="text-xs font-semibold text-blue-500 dark:text-blue-400">{comment.authorName}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{comment.text}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
            placeholder="コメントを追加..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleAddComment}
            disabled={!commentInput.trim()}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- カンバンボード：カラム ----

function Column({
  title, todos, color, onToggle, onDelete, onAddComment,
}: {
  title: string;
  todos: Todo[];
  color: "blue" | "green";
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onAddComment: (todoId: number, text: string) => void;
}) {
  const headerClass = color === "blue"
    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
    : "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800";
  const badgeClass = color === "blue"
    ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
    : "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300";

  return (
    <div className="flex flex-col flex-1 min-w-0 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-4 py-3 border-b ${headerClass}`}>
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{title}</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>{todos.length}</span>
      </div>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-3 min-h-[200px]">
          {todos.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-300 dark:text-gray-600 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              ここにドロップ
            </div>
          ) : (
            todos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onAddComment={onAddComment} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ---- カンバンボード本体（Supabase連携） ----

function KanbanBoard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Supabaseからタスクを取得
  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("id, text, completed, user_id, comments(id, text, author_name)")
      .eq("user_id", user.id)
      .order("id", { ascending: true });

    if (!error && data) {
      setTodos(
        data.map((row) => ({
          id: row.id,
          text: row.text,
          completed: row.completed,
          userId: row.user_id,
          comments: (row.comments ?? []).map((c: { id: number; text: string; author_name: string }) => ({
            id: c.id,
            text: c.text,
            authorName: c.author_name,
          })),
        }))
      );
    }
    setLoading(false);
  }, [user.id, supabase]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const addTodo = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");
    const newId = Date.now();
    // 楽観的更新
    const optimistic: Todo = { id: newId, text: trimmed, completed: false, userId: user.id, comments: [] };
    setTodos((prev) => [...prev, optimistic]);
    const { error } = await supabase
      .from("todos")
      .insert({ id: newId, text: trimmed, completed: false, user_id: user.id });
    if (error) { setTodos((prev) => prev.filter((t) => t.id !== newId)); }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));
    await supabase.from("todos").update({ completed: newCompleted }).eq("id", id);
  };

  const deleteTodo = async (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  };

  const addComment = async (todoId: number, text: string) => {
    const newId = Date.now();
    const optimistic: Comment = { id: newId, text, authorName: user.name };
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, comments: [...t.comments, optimistic] } : t))
    );
    const { error } = await supabase
      .from("comments")
      .insert({ id: newId, todo_id: todoId, text, author_name: user.name });
    if (error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todoId ? { ...t, comments: t.comments.filter((c) => c.id !== newId) } : t))
      );
    }
  };

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as number);

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const overId = over.id as string | number;
    const activeTodo = todos.find((t) => t.id === activeId);
    if (!activeTodo) return;
    if (overId === "incomplete" || overId === "complete") {
      const shouldComplete = overId === "complete";
      if (activeTodo.completed !== shouldComplete)
        setTodos((prev) => prev.map((t) => (t.id === activeId ? { ...t, completed: shouldComplete } : t)));
      return;
    }
    const overTodo = todos.find((t) => t.id === overId);
    if (overTodo && activeTodo.completed !== overTodo.completed)
      setTodos((prev) => prev.map((t) => (t.id === activeId ? { ...t, completed: overTodo.completed } : t)));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const overId = over.id as string | number;
    let newCompleted: boolean | null = null;
    if (overId === "incomplete") newCompleted = false;
    else if (overId === "complete") newCompleted = true;
    else {
      const overTodo = todos.find((t) => t.id === overId);
      if (overTodo) newCompleted = overTodo.completed;
    }
    if (newCompleted !== null) {
      setTodos((prev) => prev.map((t) => (t.id === activeId ? { ...t, completed: newCompleted! } : t)));
      await supabase.from("todos").update({ completed: newCompleted }).eq("id", activeId);
    }
  };

  const activeTodo = activeId ? todos.find((t) => t.id === activeId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-gray-950 dark:to-gray-900 px-4 py-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kanban Board</h1>
            <p className="text-sm text-blue-500 dark:text-blue-400 mt-0.5">ようこそ、{user.name}さん</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 rounded-xl transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            ログアウト
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTodo(); }}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm text-sm"
          />
          <button
            onClick={addTodo}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            追加
          </button>
        </div>

        {loading ? (
          <div className="text-center text-sm text-gray-400 py-16">読み込み中...</div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Column title="未完了" todos={incompleteTodos} color="blue" onToggle={toggleTodo} onDelete={deleteTodo} onAddComment={addComment} />
              <Column title="完了済み" todos={completedTodos} color="green" onToggle={toggleTodo} onDelete={deleteTodo} onAddComment={addComment} />
            </div>
            <DragOverlay>
              {activeTodo ? (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 shadow-xl bg-white dark:bg-gray-800 opacity-95 rotate-1">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{activeTodo.text}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {!loading && todos.length > 0 && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            全{todos.length}件 · 完了{completedTodos.length}件 · 未完了{incompleteTodos.length}件
          </p>
        )}
      </div>
    </div>
  );
}

// ---- メインエクスポート ----

export function TodoApp() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<"login" | "register">("login");
  const [isLoaded, setIsLoaded] = useState(false);

  const supabase = createClient();

  // 起動時: Supabaseからユーザー一覧取得 + セッション復元
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.from("users").select("id, name, email").order("id");
      if (data) setUsers(data);

      try {
        const stored = localStorage.getItem("kb_currentUser");
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          // Supabaseに存在するか確認
          const found = data?.find((u) => u.id === parsed.id);
          if (found) setCurrentUser(found);
        }
      } catch {}

      setIsLoaded(true);
    };
    init();
  }, [supabase]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("kb_currentUser", JSON.stringify(user));
  };

  const handleRegister = async (name: string, email: string): Promise<string | null> => {
    const id = Date.now().toString();
    const { error } = await supabase.from("users").insert({ id, name, email });
    if (error) {
      return error.message.includes("unique") ? "このメールアドレスはすでに登録されています" : "登録に失敗しました";
    }
    const newUser: User = { id, name, email };
    setUsers((prev) => [...prev, newUser]);
    handleLogin(newUser);
    setScreen("login");
    return null;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kb_currentUser");
  };

  if (!isLoaded) return null;

  if (!currentUser) {
    if (screen === "register") {
      return <RegisterScreen onRegister={handleRegister} onBack={() => setScreen("login")} />;
    }
    return <LoginScreen users={users} onLogin={handleLogin} onShowRegister={() => setScreen("register")} />;
  }

  return <KanbanBoard user={currentUser} onLogout={handleLogout} />;
}
