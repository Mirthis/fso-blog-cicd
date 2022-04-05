import React from 'react'
import Person from './Person'

const Persons = ({ persons, onDeleteClick }) => {
  return persons.map(person => (
    <Person key={person.id} person={person} onDeleteClick={onDeleteClick} />
  ))
}

export default Persons
