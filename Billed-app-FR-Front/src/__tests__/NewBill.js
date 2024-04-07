/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import userEvent from "@testing-library/user-event"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    it("should highlight icon-mail icon", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      expect(mailIcon.className).toMatch(/active-icon/)
    })

    describe("When I don't fill fields and I click on send button", () => {
      it("should not create new bill", () => {
        document.body.innerHTML = NewBillUI();
  
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null
        const newBill = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
        const expenseName = screen.getByTestId("expense-name");
        expect(expenseName.value).toBe("");
  
        const datePicker = screen.getByTestId("datepicker");
        expect(datePicker.value).toBe("");

        const amount = screen.getByTestId("amount");
        expect(amount.value).toBe("");

        const pct = screen.getByTestId("pct");
        expect(pct.value).toBe("");

        // const file = screen.getByTestId("file");
        // expect(file.value).toBe("");

        const formNewBill = screen.getByTestId("form-new-bill");
        // Différence entre les deux ?
        const handleSubmit = jest.fn((e) => e.preventDefault());
        // const handleSubmit = jest.fn(newBill.handleSubmit);
  
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        // expect(screen.getByTestId("form-new-bill")).toBeTruthy();
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      });
    });

    describe("When I fill fields and I click on send button", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
      })

      it("should create new bill", async () => {
        document.body.innerHTML = NewBillUI();

        const data = {
          expenseName: "Nom de la dépense",
          datePicker: "2024-04-04",
          amount: '123',
          pct: '70',
          vat: '20',
          file: new File(['test'], 'test.png', {type: 'image/png'})
        }

        // const formData = new FormData() 
        // formData.append('file', fileToUpload)
        // formData.append('email', 'a@a')

        // mockStore.bills.mockImplementationOnce(() => {
        //   return {
        //     create : (formData) =>  {
        //       return Promise.resolve(formData)
        //     }
        //   }
        // })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
  
        const expenseName = screen.getByTestId("expense-name");
        fireEvent.change(expenseName, {target: { value: data.expenseName}})
        expect(expenseName.value).toBe(data.expenseName);
  
        const datePicker = screen.getByTestId("datepicker");
        fireEvent.change(datePicker, {target: { value: data.datePicker}})
        expect(datePicker.value).toBe(data.datePicker);

        const amount = screen.getByTestId("amount");
        fireEvent.change(amount, {target: { value: data.amount}})
        expect(amount.value).toBe(data.amount);

        const pct = screen.getByTestId("pct");
        fireEvent.change(pct, {target: { value: data.pct}})
        expect(pct.value).toBe(data.pct);

        const fileInput = screen.getByTestId("file");
        userEvent.upload(fileInput, data.file)
        expect(fileInput.files[0]).toBeTruthy();

        // const event = {
        //   target: {
        //     files: [fileToUpload],
        //   }
        // };
        // fireEvent.change(fileInput, event)
        // expect(fileInput.files[0]).toStrictEqual(file);

        const formNewBill = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn(newBill.handleSubmit);
        // const handleSubmitSpy = jest.spyOn(newBill, 'handleSubmit');
  
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        // expect(handleSubmitSpy).toHaveBeenCalled();
        expect(handleSubmit).toHaveBeenCalled();

        await waitFor(() => screen.getByText("Mes notes de frais"))
        
        expect(screen.getByText("Mes notes de frais")).toBeTruthy();
        
        
        await waitFor(() => screen.getByText("Nom"))
        const createdBill = screen.getByText('Nom de la dépense');
        expect(createdBill).toBeTruthy();
      });
    });

  })
})
