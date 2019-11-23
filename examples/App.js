import { h, render } from 'fiber';

function App() {
  return (
    <div>
      <span>Learn-Fiber</span>
    </div>
  );
}

render(<App />, document.getElementById('root'));
