/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import Actions from "../views/Actions.js"
import { bills } from "../fixtures/bills.js"

import '@testing-library/jest-dom/extend-expect'

describe('Given I am connected as an Employee', () => {
  describe('When I am on Bills page and there are bills', () => {
    test(('Then, it should render icon eye'), () => {
      const html = Actions(bills[0].fileUrl, bills[0].id)
      document.body.innerHTML = html
      screen.getByTestId('eye-47qAXb6fIm2zOKkLzMro')
      expect(screen.getByTestId('eye-47qAXb6fIm2zOKkLzMro')).toBeTruthy()
    })
  })
  describe('When I am on Bills page and there are bills with url for file', () => {
    test(('Then, it should save given url in data-bill-url custom attribute'), () => {
      const url = '/fake_url'
      const html = Actions(url, '47qAXb6fIm2zOKkLzMro')
      document.body.innerHTML = html
      expect(screen.getByTestId('eye-47qAXb6fIm2zOKkLzMro')).toHaveAttribute('data-bill-url', url)
    })
  })
})
