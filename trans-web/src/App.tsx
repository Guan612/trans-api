import { useState } from "react";

function App() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null); // 存放 { translation: "", keywords: [] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 发送请求到 FastAPI 后端
      const response = await fetch("http://127.0.0.1:8000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("翻译出错，请检查后端是否启动。" + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🤖 AI 智能翻译助手
        </h1>

        {/* 输入区域 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            请输入中文内容
          </label>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition h-32 resize-none"
            placeholder="例如：人工智能将彻底改变我们的工作方式..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* 按钮 */}
        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className={`w-full py-3 rounded-lg text-white font-semibold transition
            ${
              loading || !inputText.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
        >
          {loading ? "翻译中..." : "开始翻译"}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* 结果展示区 */}
        {result && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">翻译结果：</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-800 text-lg leading-relaxed border border-gray-200">
              {result.translation}
            </div>

            {/* 关键词展示 */}
            {result.keywords && result.keywords.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  关键词提取：
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
