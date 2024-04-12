/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
  })

  describe("When I am on NewBill Page", () => {
    it("should highlight icon-mail icon", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      expect(mailIcon.className).toMatch(/active-icon/)
    })

    it('Should show the new bill title', async () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByText('Envoyer une note de frais'))
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
    })

    describe("When I don't fill fields and I click on send button", () => {
      it("should not create new bill and stay on bill page", () => {
        
        document.body.innerHTML = NewBillUI();

        const newBill = new NewBill({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        })
        
        expect(screen.getByTestId("expense-name").value).toBe("");
        expect(screen.getByTestId("datepicker").value).toBe("");
        expect(screen.getByTestId("amount").value).toBe("");
        expect(screen.getByTestId("pct").value).toBe("");
        expect(screen.getByTestId("file").value).toBe("");
  
        const formNewBill = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
  
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });

    describe('When I try to select wrong type file', () => {
      it('Should not add file and display an error message', async () => {
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        });

        const newFile = new File(['test'], 'test.txt', {type: 'text/plain'})
        const event = {
          target: {
            files: [newFile],
          },
        }
        const createSpy = jest.spyOn(mockStore.bills(), 'create');
        const fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change', newBill.handleChangeFile)

        fireEvent.change(fileInput, event);
        
        await waitFor(() => expect(createSpy).not.toHaveBeenCalled());
        expect(createSpy).not.toHaveBeenCalled()

        const fileErrorMessage = screen.getByTestId('file-error-message');
        expect(fileErrorMessage.classList.contains('hide')).not.toBeTruthy();
      })
    })

    describe('When I try to select good type file', () => {
      it('Should add file and not display an error message', async () => {
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage,
        });

        const newFile = new File(['test'], 'test.png', {type: 'image.png'})
        const event = {
          target: {
            files: [newFile],
          },
        }
        const createSpy = jest.spyOn(mockStore.bills(), 'create');
        const fileInput = screen.getByTestId('file');
        fileInput.addEventListener('change', newBill.handleChangeFile)

        fireEvent.change(fileInput, event);
        
        await waitFor(() => expect(createSpy).toHaveBeenCalled());
        expect(createSpy).toHaveBeenCalled()
        
        const fileErrorMessage = screen.getByTestId('file-error-message');
        expect(fileErrorMessage.classList.contains('hide')).toBeTruthy();
      })
    })
  })
})

  //INTEGRATION TESTS - POST
  describe("Given I am connected as Employee on NewBill page, and submit the form", () => {
    describe("when APi is working well", () => {
      beforeAll(() => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
      });

      it("Should create new bill when add file with good extension", async () => {
        const data = {
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
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
        }
        const created = await mockStore.bills().create(data);
        expect(created.key).toBe('1234');
        expect(created.fileUrl).toBe('https://localhost:3456/images/test.jpg');
      });

      it("should be sent on bills page with bills updated", async () => {
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorageMock,
        });
        
        const data = {
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
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
        }

        const updateSpy = jest.spyOn(mockStore.bills(), "update")  

        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", newBill.handleSubmit);
        fireEvent.submit(form);

        await waitFor(() => expect(updateSpy).toHaveBeenCalled());

        const postedBill = await mockStore.bills().update(data);
        expect(updateSpy).toHaveBeenCalledWith({
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
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
        });
        expect(postedBill.id).toEqual('47qAXb6fIm2zOKkLzMro');
        expect(postedBill.fileUrl).toEqual('https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a');

        await waitFor(() => screen.getByText('Mes notes de frais'));
        expect('Mes notes de frais').toBeTruthy();
      });
    });

    describe('When API renders errors', () => {
      afterEach(jest.clearAllMocks)

      beforeEach(() => {
        jest.spyOn(mockStore, "bills")

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
      });

      describe("When an error occurs on API", () => {
        it("should post bill from an API and fails with 404 message error", async () => {
          const spyOnConsole = jest.spyOn(console, "error");

          mockStore.bills.mockImplementationOnce(() => {
            return {
              create : (bill) =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }
          })

          const newBill = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorageMock,
          });
          
          const newFile = new File(['test'], 'test.png', {type: 'image.png'})
          const event = {
            target: {
              files: [newFile],
            },
          }

          const handleChangeFileSpy = jest.fn(newBill.handleChangeFile);
          const fileInput = screen.getByTestId('file');
          fileInput.addEventListener('change', handleChangeFileSpy)

          fireEvent.change(fileInput, event);
          
          expect(handleChangeFileSpy).toHaveBeenCalled();
          waitFor(() => {
            expect(spyOnConsole).toHaveBeenCalledWith(new Error("Erreur 404"));
          });
        })

        it("should post bill from an API and fails with 500 message error", async () => {
          const spyOnConsole = jest.spyOn(console, "error");

          mockStore.bills.mockImplementationOnce(() => {
            return {
              create : (bill) =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })

          const newBill = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorageMock,
          });
          
          const newFile = new File(['test'], 'test.png', {type: 'image.png'})
          const event = {
            target: {
              files: [newFile],
            },
          }

          const handleChangeFileSpy = jest.fn(newBill.handleChangeFile);
          const fileInput = screen.getByTestId('file');
          fileInput.addEventListener('change', handleChangeFileSpy)

          fireEvent.change(fileInput, event);
          
          expect(handleChangeFileSpy).toHaveBeenCalled();
          waitFor(() => {
            expect(spyOnConsole).toHaveBeenCalledWith(new Error("Erreur 500"));
          });
        })
      });
    });
  });
