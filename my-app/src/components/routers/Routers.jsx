import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Admin from '../pages/Admin'
import Client from '../pages/Client'
import ClientHead from '../pages/ClientHead'
import Employee from '../pages/Employee'
import ProjectManager from '../pages/ProjectManager'

function Routers() {
    return (
        <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/admin' element={<Admin />} />
            <Route path='/client' element={<Client />} />
            <Route path='/client-head' element={<ClientHead />} />
            <Route path='/employee' element={<Employee />} />
            <Route path='/projectmanager' element={<ProjectManager />} />
        </Routes>
    )
}

export default Routers
