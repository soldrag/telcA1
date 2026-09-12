import React from 'react';
import SchreibenTeil1 from './SchreibenTeil1.jsx';
import SchreibenTeil2 from './SchreibenTeil2.jsx';

export default function SchreibenTeilRenderer({
  activeTeil = 1,
  questions = [],
  session = {},
}) {
  const teil1Questions = questions.filter((q) => q.teil === 1);
  const teil2Questions = questions.filter((q) => q.teil === 2);
  const essayQuestion = teil2Questions[0] || questions[questions.length - 1];

  if (activeTeil === 2) {
    return (
      <SchreibenTeil2
        question={essayQuestion}
        session={session}
      />
    );
  }

  return (
    <SchreibenTeil1
      questions={teil1Questions}
      session={session}
    />
  );
}
