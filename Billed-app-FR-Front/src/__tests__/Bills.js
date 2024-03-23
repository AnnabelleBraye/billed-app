/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When loading is true", () => {
    it("Should render loading page", () => {
      document.body.innerHTML = BillsUI({loading: true})
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("When error is true", () => {
    it("Should render error page", () => {
      document.body.innerHTML = BillsUI({error: 'There is an error'})
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

      expect(windowIcon.className).toMatch(/active-icon/)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^([1-9]|[12][0-9]|3[01])[- /.](\S+.{3})[- /.]([0-9]{2})$/i).map(a => a.innerHTML)
      const sortedDates = [...dates].sort(antiChrono)
      expect(sortedDates).toEqual(dates)
    })

    // describe("When I click on first bill eye-icon", async () => {
    //   it("Should open modal", async () => {
    //     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    //     window.localStorage.setItem('user', JSON.stringify({
    //       type: 'Employee'
    //     }))
    //     document.body.innerHTML = BillsUI(bills)
    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname })
    //     }
    //     const store = null
    //     const bill = new Bills({
    //       document, onNavigate, store, localStorage: window.localStorage
    //     })

    //     const handleClickIconEye = jest.fn(bill.handleClickIconEye)
    //     await waitFor(() => {
    //       screen.getAllByTestId('icon-eye')
    //     })
    //     const eye = screen.getAllByTestId('icon-eye')
    //     eye.addEventListener('click', handleClickIconEye)
    //     userEvent.click(eye)
    //     expect(handleClickIconEye).toHaveBeenCalled()

    //     const modale = screen.getByTestId('modaleFile')
    //     expect(modale).toBeTruthy()
    //   })
    // })
  })
})
