import { useState, useEffect } from "react";
import "./index.css";

/**
 * [실습] API 호출 함수 정의
 * 직접 fetch/axios 로직을 채워 넣어 보세요 ~!.
 */

// 스웨거에 명시된 서버 주소 (API가 실제 동작하는 본체입니다)
const BASE_URL = "https://congachu.dev";

// 본인의 학번! (나만의 데이터를 구분하기 위한 열쇠입니다)
const STUDENT_CODE = "20242889";

const todoApi = {
  // 1. 할 일 조회 (GET /api/todos)
  getTodos: async () => {
    console.log("GET: 할 일 목록 조회 호출됨");
    /**
     * TODO: fetch를 사용하여 서버로부터 할 일 목록을 가져오는 코드를 작성하세요.
     * 1. fetch(`${BASE_URL}/api/todos?code=${STUDENT_CODE}`)
     * 2. 응답받은 JSON 데이터를 반환하세요.
     */
    // 1. 서버에 GET 요청 보내기 (주소 뒤에 ?code=학번 필수!)
    const response = await fetch(`${BASE_URL}/api/todos?code=${STUDENT_CODE}`);

    // 2. JSON 형식의 응답 본문을 해석파싱
    const data = await response.json();
    return data;
  },

  // 2. 할 일 생성 (POST /api/todos)
  createTodo: async (content) => {
    console.log("POST: 할 일 생성 호출됨", content);
    /**
     * TODO: 서버에 새로운 할 일을 생성해달라고 요청하는 코드를 작성하세요.
     * 1. method는 "POST"
     * 2. headers에 "Content-Type": "application/json" 설정
     * 3. body에 JSON.stringify({ content: content }) 설정
     */
    const response = await fetch(`${BASE_URL}/api/todos?code=${STUDENT_CODE}`, {
      method: "POST", // 1. POST 방식 명시
      headers: {
        "Content-Type": "application/json", // 2. JSON 데이터임을 서버에 알림
      },
      // 3. 명세서에 약속된 필드명 'content'에 데이터를 담아 JSON(문자열)로 포장
      body: JSON.stringify({ content: content }),
    });

    const data = await response.json();
    return data;
  },

  // 3. 할 일 상태 변경 (POST /api/todos/{id})
  toggleTodo: async (id, completed) => {
    console.log("POST: 할 일 상태 변경 호출됨", id, completed);
    /**
     * TODO: 특정 할 일의 완료 여부(completed)를 업데이트하는 코드를 작성하세요.
     * URL에 id를 포함시키고, body에 변경할 상태를 담아 보내세요.
     */
    // [추가] 과제 가이드에 맞게 작성된 상태 변경 통신 로직
    const response = await fetch(
      `${BASE_URL}/api/todos/${id}?code=${STUDENT_CODE}`,
      {
        method: "POST", // 명세서 규칙에 따라 POST 메서드 사용
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: completed }), // 변경할 상태를 body에 담아 전달
      },
    );

    const data = await response.json();
    return data;
  },

  // 4. 할 일 삭제 (DELETE /api/todos/{id})
  deleteTodo: async (id) => {
    console.log("DELETE: 할 일 삭제 호출됨", id);
    /**
     * TODO: 특정 할 일을 서버에서 삭제하는 코드를 작성하세요.
     * method는 "DELETE"를 사용합니다.
     */
    // [추가] 과제 가이드에 맞게 작성된 삭제 통신 로직
    const response = await fetch(
      `${BASE_URL}/api/todos/${id}?code=${STUDENT_CODE}`,
      {
        method: "DELETE", // 명세서 규칙에 따라 DELETE 메서드 사용
      },
    );

    // 본문이 비어있을 수 있으므로 .json()을 호출하지 않고,
    // 응답이 성공적(200번대)이었는지 확인하는 통과 신호만 보냅니다.
    if (!response.ok) {
      throw new Error("삭제 요청 실패");
    }

    return true;
  },
};

/**
 * [컴포넌트] TodoInput
 * 새로운 할 일을 입력받아 추가 버튼을 누르면 작동하는 영역입니다.
 */
function TodoInput({ onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 막습니다.
    if (!text.trim()) return; // 입력값이 없으면 아무것도 하지 않습니다.
    onAdd(text); // App 컴포넌트에서 전달받은 handleAddTodo 함수를 실행합니다.
    setText(""); // 입력창을 비웁니다.
  };

  return (
    <form className="todo-input-group" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="새로운 할 일을 입력하세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="add-btn">
        추가
      </button>
    </form>
  );
}

/**
 * [컴포넌트] TodoItem
 * 할 일 목록에서 보여질 각각의 한 줄(Row)을 의미합니다.
 */
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, !todo.completed)}
      />
      <span>{todo.content}</span>
      <button className="delete-btn" onClick={() => onDelete(todo.id)}>
        삭제
      </button>
    </li>
  );
}

/**
 * [메인] App 컴포넌트
 * 프로그램의 심장부로, 전체 데이터(todos)와 API 연동 로직이 모여있습니다.
 */
function App() {
  // 실제 화면에 그려질 할 일 목록 데이터를 저장하는 State입니다.
  const [todos, setTodos] = useState([]);

  /**
   * 1. 초기 데이터 로드 (컴포넌트가 처음 화면에 나타날 때 실행)
   * useEffect는 특정 시점에 코드를 실행하게 해주는 훅입니다.
   */
  useEffect(() => {
    const loadTodos = async () => {
      try {
        console.log("초기 데이터 로드 시도...");
        // 1단계: 서버에서 최신 할 일 목록 데이터를 가져옵니다.
        const serverData = await todoApi.getTodos();

        // 2단계: 가져온 데이터를 todos state에 저장하여 화면에 그립니다.
        setTodos(serverData);
      } catch (error) {
        // API 호출 중 오류가 발생하면 이곳에서 처리합니다.
        console.error("데이터를 불러오지 못했습니다.", error);
      }
    };
    loadTodos();
  }, []); // []는 컴포넌트가 처음 나타날 때 딱 한 번만 실행하라는 의미입니다.

  /**
   * 2. 할 일 추가 로직
   * 입력창에서 '추가' 버튼을 눌렀을 때 실행됩니다.
   */
  const handleAddTodo = async (content) => {
    try {
      // 1단계: 서버에 "이 내용으로 할 일 하나 만들어줘!"라고 요청합니다.
      await todoApi.createTodo(content);
      console.log("할 일 추가 완료:", content);

      // 2단계: 서버에 데이터가 추가되었으므로, 서버에서 '최신화된 전체 목록'을 다시 받아옵니다.
      // (내가 직접 목록에 추가하는 것보다 서버 데이터를 다시 받는 것이 가장 정확합니다.)
      const updatedTodos = await todoApi.getTodos();
      setTodos(updatedTodos);
    } catch (error) {
      console.error("할 일 추가에 실패했습니다.", error);
    }
  };

  /**
   * 3. 완료 상태 변경 로직
   * 체크박스를 클릭했을 때 실행됩니다.
   */
  const handleToggleTodo = async (id, completed) => {
    try {
      // 1단계: 서버에 "이 ID를 가진 할 일의 완료 상태를 바꿔줘!"라고 요청합니다.
      await todoApi.toggleTodo(id, completed);
      console.log("상태 변경 완료:", id, completed);

      // 2단계: 상태가 바뀌었으므로 다시 서버에서 최신 목록을 받아와 화면을 갱신합니다.
      const updatedTodos = await todoApi.getTodos();
      setTodos(updatedTodos);
    } catch (error) {
      console.error("상태 변경에 실패했습니다.", error);
    }
  };

  /**
   * 4. 할 일 삭제 로직
   * '삭제' 버튼을 눌렀을 때 실행됩니다.
   */
  const handleDeleteTodo = async (id) => {
    try {
      // 1단계: 서버에 "이 ID를 가진 할 일을 지워줘!"라고 요청합니다.
      await todoApi.deleteTodo(id);
      console.log("삭제 완료:", id);

      // 2단계: 데이터가 지워졌으므로 다시 서버에서 최신 목록을 받아와 화면을 갱신합니다.
      const updatedTodos = await todoApi.getTodos();
      setTodos(updatedTodos);
    } catch (error) {
      console.error("삭제에 실패했습니다.", error);
    }
  };

  return (
    <div className="app-container">
      <h1>Todo API Session</h1>
      <p className="description">아기사자의 API 연동 실습을 위한 투두리스트</p>

      {/* 할 일 입력 영역 */}
      <TodoInput onAdd={handleAddTodo} />

      {/* 할 일 목록 출력 영역 */}
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
          />
        ))}
      </ul>

      {/* 안내 문구 영역 */}
      <div className="api-indicator">
        <h4>Developer Console</h4>
        <p>상태 변화나 API 호출 로그는 브라우저 콘솔(F12)에서 확인하세요.</p>
      </div>
    </div>
  );
}

export default App;
