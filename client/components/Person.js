import React from 'react'

const Person = ({ person, onDeleteClick }) => (
  <div>
    {person.name} {person.number}
    <button data-id={person.id} onClick={onDeleteClick}>
      delete
    </button>
  </div>
)

export default Person
