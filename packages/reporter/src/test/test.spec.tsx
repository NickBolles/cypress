import React from 'react'
import { shallow, mount, ReactWrapper } from 'enzyme'
import sinon, { SinonSpy } from 'sinon'
import Test, { NoCommands } from './test'
import TestModel from './test-model'
import { Scroller } from '../lib/scroller'
import { AppState } from '../lib/app-state'
import Hooks from '../hooks/hooks'
import { CommandProps } from '../commands/command-model'

const appStateStub = (props?: Partial<AppState>) => {
  return {
    autoScrollingEnabled: true,
    isRunning: true,
    ...props,
  } as AppState
}

const model = (props?: Partial<TestModel>) => {
  return {
    agents: [],
    commands: [],
    hooks: [],
    err: {},
    id: 't1',
    isActive: true,
    level: 1,
    routes: [],
    shouldRender: true,
    state: 'passed',
    title: 'some title',
    callbackAfterUpdate: () => {},
    toggleOpen: sinon.stub(),
    ...props,
  } as any
}

type ScrollerStub = Scroller & {
  scrollIntoView: SinonSpy
}

const scrollerStub = () => ({
  scrollIntoView: sinon.spy(),
} as ScrollerStub)

describe('<Test />', () => {
  it('does not render when it should not render', () => {
    const component = shallow(<Test model={model({ shouldRender: false })} />)

    expect(component).to.be.empty
  })

  context('toggleOpen', () => {
    it('calls toggleOpen when toggled', () => {
      const _model = model({ state: 'failed' })
      const component = mount(<Test model={_model} />)

      component.find('.collapsible-header').first().simulate('click')
      expect(_model.toggleOpen).calledOnce
    })
  })

  context('contents', () => {
    it('does not render the contents if not open', () => {
      const component = mount(<Test model={model({ isOpen: false })} />)

      expect(component.find('.runnable-instruments')).to.be.empty
    })

    it('renders the contents if open', () => {
      const component = mount(<Test model={model({ isOpen: true })} />)

      expect(component.find('.runnable-instruments')).not.to.be.empty
    })

    // it('renders <Hooks /> if there are commands', () => {
    //   const component = mount(<Test model={model({ attempts: [{ commands: [{ id: '1' }], agents: [], routes: [], isOpen: true, state: 'passed', err: {} }], isOpen: true, state: 'passed', err: { codeFrame: false } })} />)

    //   console.log(component)
    //   expect(component.find(Hooks)).to.exist
    // })
  })

  context('scrolling into view', () => {
    let scroller: Scroller

    beforeEach(() => {
      scroller = scrollerStub()

      global.window.requestAnimationFrame = function (callback: () => void) {
        callback()
      }
    })

    context('on mount', () => {
      it('scrolls into view if auto-scrolling is enabled, app is running, the model should render, and the model.isActive is null', () => {
        const component = mount(
          <Test
            appState={appStateStub()}
            model={model()}
            scroller={scroller}
          />,
        )

        expect(scroller.scrollIntoView).to.have.been.calledWith((component.instance() as any).containerRef.current)
      })

      it('does not scroll into view if auto-scrolling is disabled', () => {
        mount(
          <Test
            appState={appStateStub({ autoScrollingEnabled: false })}
            model={model()}
            scroller={scroller}
          />,
        )

        expect(scroller.scrollIntoView).not.to.have.been.called
      })

      it('does not scroll into view if app is not running', () => {
        mount(
          <Test
            appState={appStateStub({ isRunning: false })}
            model={model()}
            scroller={scroller}
          />,
        )

        expect(scroller.scrollIntoView).not.to.have.been.called
      })

      it('does not scroll into view if model should not render', () => {
        mount(
          <Test
            appState={appStateStub()}
            model={model({ shouldRender: false })}
            scroller={scroller}
          />,
        )

        expect(scroller.scrollIntoView).not.to.have.been.called
      })

      it('does not scroll into view if model.state is processing', () => {
        mount(
          <Test
            appState={appStateStub()}
            model={model({ state: 'processing' })}
            scroller={scroller}
          />,
        )

        expect(scroller.scrollIntoView).not.to.have.been.called
      })
    })

    context('on update', () => {
      let appState: AppState
      let testModel: TestModel
      let component: ReactWrapper<Test>

      beforeEach(() => {
        appState = appStateStub({ autoScrollingEnabled: false, isRunning: false })
        testModel = model({ state: 'processing' })
        component = mount(<Test appState={appState} model={testModel} scroller={scroller} />)
      })

      // it('scrolls into view if auto-scrolling is enabled, app is running, the model should render', () => {
      //   appState.id = 'fooo'
      //   appState.autoScrollingEnabled = true
      //   appState.isRunning = true
      //   testModel.state = 'processing'
      //   testModel.shouldRender = true
      //   component.instance()!.componentDidUpdate!({}, {})
      //   expect(scroller.scrollIntoView).to.have.been.calledWith((component.instance() as any).containerRef.current)
      // })

      it('does not scroll into view if auto-scrolling is disabled', () => {
        appState.isRunning = true
        testModel.state = 'processing'
        component.instance()!.componentDidUpdate!({}, {})
        expect(scroller.scrollIntoView).not.to.have.been.called
      })

      it('does not scroll into view if app is not running', () => {
        appState.autoScrollingEnabled = true
        testModel.state = 'processing'
        component.instance()!.componentDidUpdate!({}, {})
        expect(scroller.scrollIntoView).not.to.have.been.called
      })

      it('does not scroll into view if model.isActive is null', () => {
        appState.autoScrollingEnabled = true
        appState.isRunning = true
        component.instance()!.componentDidUpdate!({}, {})
        expect(scroller.scrollIntoView).not.to.have.been.called
      })
    })
  })
})
