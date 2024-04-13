/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import { formatDate } from "../app/format.js"

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

  describe('When I am on Bills page, there are bills with date', () => {
    it('Should format date to format "13 Avr. 24', () => {
      const formatedDate = formatDate("2024-04-13")
      expect(formatedDate).toBe('13 Avr. 24')
    })
  })

  describe('When I am on Bills page, there are bills with date', () => {
    it('Should not format date to format "13 Avr. 24" when wrong date format', () => {
      const formatedDate = formatDate("test")
      expect(formatedDate).not.toBe('13 Avr. 24')
      expect(formatedDate).toBe('test')
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

    

    describe("When I click on first bill eye-icon", () => {
      it("Should open modal", async () => {
        const firstBill = [{
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          "status": "pending",
          "type": "Hôtel et logement",
          "commentary": "séminaire billed",
          "name": "encore",
          "fileName": "preview-facture-free-201801-pdf-1.jpg",
          "date": "2004-04-04",
          "amount": 400,
          "commentAdmin": "ok",
          "email": "a@a",
          "pct": 20
        }]

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        document.body.innerHTML = BillsUI({data: firstBill})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })
        
        const modale = screen.getByTestId('modaleBillEmployee')
        expect(modale).toBeTruthy();

        const eyeIcon = screen.getByTestId('eye-47qAXb6fIm2zOKkLzMro')
        expect(eyeIcon).toBeTruthy();
        
        const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eyeIcon))
        eyeIcon.addEventListener('click', handleClickIconEye)
        $.fn.modal = jest.fn().mockImplementationOnce(() => modale.classList.add('show'))
        userEvent.click(eyeIcon)
        expect(handleClickIconEye).toHaveBeenCalled()

        const test = screen.getByAltText('Bill');
        expect(test).toBeTruthy();
      })
    }),

    describe('When I click on new bill button', () => {
      it('should render new bill page', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        document.body.innerHTML = BillsUI({data: bills})
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const bill = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        })

        const buttonNewBill = screen.getByTestId('btn-new-bill')
        expect(buttonNewBill).toBeTruthy()
        
        const handleClickNewBill = jest.fn(bill.handleClickNewBill)
        buttonNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(buttonNewBill)
        expect(handleClickNewBill).toHaveBeenCalled()

        await waitFor(() => {
          screen.getByText('Envoyer une note de frais')
        })
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      })
    })
  })
})

// test d'intégration GET
describe("Given I'm a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByTestId("eye-47qAXb6fIm2zOKkLzMro")).toBeTruthy()
      expect(screen.getByTestId("eye-BeKy5Mo4jkmdfPGYpTxZ")).toBeTruthy()
      expect(screen.getByTestId("eye-UIUZtnPQvnbFnB0ozvJh")).toBeTruthy()
      expect(screen.getByTestId("eye-qcCK3SzECmaZAGRrHjaC")).toBeTruthy()
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window,'localStorage',{ value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
      })

      // TODO test GET list

      it("should fetch bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      it("should fetch messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getByText(/Erreur 500/))
        expect(screen.getByText(/Erreur 500/)).toBeTruthy()
      })
    })

  })
})
