import React, { useState, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import withAuth from '../HoC/withAuth'
import { Spinner, Pagination, Message, Search, Meta } from '../components'
import moment from 'moment'
import apiHook from '../api'
import { ITrip } from '../models/Trip'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { FcExpired } from 'react-icons/fc'

interface Item extends Omit<ITrip, 'rider' | 'driver'> {
  rider: {
    _id: string
    name: string
  }
  driver: {
    _id: string
    name: string
  }
  image: string
  name: string
}

const Trips = () => {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')

  const getApi = apiHook({
    key: ['trips'],
    method: 'GET',
    url: `trips?page=${page}&q=${q}&limit=${25}`,
  })?.get

  useEffect(() => {
    getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (!q) getApi?.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const searchHandler = (e: FormEvent) => {
    e.preventDefault()
    getApi?.refetch()
    setPage(1)
  }

  // TableView
  const table = {
    header: ['Name', 'Address', 'Mobile', 'Email'],
    body: ['name', 'address', 'mobile', 'user.email'],
    createdAt: 'createdAt',
    image: 'image',
    data: getApi?.data,
  }

  const name = 'Trips List'

  return (
    <>
      <Meta title="Trips" />

      <div className="ms-auto text-end">
        <Pagination data={table.data} setPage={setPage} />
      </div>

      {getApi?.isLoading ? (
        <Spinner />
      ) : getApi?.isError ? (
        <Message variant="danger" value={getApi?.error} />
      ) : (
        <div className="table-responsive bg-light p-3 mt-2">
          <div className="d-flex align-items-center flex-column mb-2">
            <h3 className="fw-light text-muted">
              {name}
              <sup className="fs-6"> [{table?.data?.total}] </sup>
            </h3>

            <div className="col-auto">
              <Search
                placeholder="Search by mobile"
                setQ={setQ}
                q={q}
                searchHandler={searchHandler}
              />
            </div>
          </div>

          <div className="row gy-3 my-3">
            <div className="col-lg-3 col-md-4 col-6 mx-auto">
              <div className="card shadow-sm">
                <div className="card-body">
                  <FaCheckCircle className="mb-1 text-success me-2" />
                  <span className="fw-bold text-uppercase">
                    {getApi?.data?.completedRide | 0} Rides were completed
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6 mx-auto">
              <div className="card shadow-sm">
                <div className="card-body">
                  <FaTimesCircle className="mb-1 text-danger me-2" />
                  <span className="fw-bold text-uppercase">
                    {getApi?.data?.cancelledRide | 0} Rides were cancelled
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6 mx-auto">
              <div className="card shadow-sm">
                <div className="card-body">
                  <FcExpired className="mb-1 text-warning me-2" />
                  <span className="fw-bold text-uppercase">
                    {getApi?.data?.expiredRide | 0} Rides were expired
                  </span>
                </div>
              </div>
            </div>
          </div>
          <table className="table table-sm table-border">
            <thead className="border-0">
              <tr>
                <th>Rider</th>
                <th>Driver</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {getApi?.data?.data?.map((item: Item, i: number) => (
                <tr key={i}>
                  <td>{item?.rider?.name}</td>
                  <td>
                    {item?.driver?.name || (
                      <span className="badge bg-danger">Not Found</span>
                    )}
                  </td>
                  <td>{item?.origin?.description?.slice(0, 30) + '...'}</td>
                  <td>
                    {item?.destination?.description?.slice(0, 30) + '...'}
                  </td>
                  {item?.status === 'pending' && (
                    <td>
                      <span className="badge bg-primary">{item?.status}</span>
                    </td>
                  )}
                  {item?.status === 'completed' && (
                    <td>
                      <span className="badge bg-success">{item?.status}</span>
                    </td>
                  )}
                  {item?.status === 'cancelled' && (
                    <td>
                      <span className="badge bg-danger">{item?.status}</span>
                    </td>
                  )}
                  {item?.status === 'expired' && (
                    <td>
                      <span className="badge bg-dark text-light">
                        {item?.status}
                      </span>
                    </td>
                  )}
                  <td>{moment(item?.createdAt).format('lll')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Trips)), {
  ssr: false,
})
