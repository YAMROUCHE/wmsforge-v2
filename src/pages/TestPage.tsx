export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-green-600">✅ React fonctionne!</h1>
      <p className="mt-4 text-xl">Si vous voyez ce message, React se charge correctement.</p>

      <div className="mt-8 p-4 bg-blue-100 rounded">
        <h2 className="text-2xl font-bold mb-4">Tests:</h2>
        <ul className="space-y-2">
          <li>✅ HTML chargé</li>
          <li>✅ React monté</li>
          <li>✅ Tailwind CSS fonctionne</li>
        </ul>
      </div>
    </div>
  );
}
