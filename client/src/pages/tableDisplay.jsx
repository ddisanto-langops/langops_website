import { Table } from '../components/table'
import { Sort } from '../components/sort'

export default function TableDisplay() {
  return (
  <>
    <h1>Table</h1>
    <h2>Sort</h2>
    <div>
      <Sort />
    </div>
    <div>
      <Table />
    </div>
  </>
)
}