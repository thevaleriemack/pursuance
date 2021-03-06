import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import * as postgrest from '../../../../api/postgrest';
import generateId from '../../../../utils/generateId';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import TiPlus from 'react-icons/lib/ti/plus';
import TiMinus from 'react-icons/lib/ti/minus';
import TiFlowChildren from 'react-icons/lib/ti/flow-children';
import FaCommentsO from 'react-icons/lib/fa/comments-o';
import TaskForm from '../../TaskManager/TaskForm/TaskForm';
import AssignerSuggestions from '../../TaskManager/TaskForm/Suggestions/AssignerSuggestions';
import AssignerInput from '../../TaskManager/TaskForm/AssignerInput/AssignerInput';
import TaskStatus from '../../TaskStatus/TaskStatus';
import { filterSuggestion } from '../../../../utils/suggestions';
import './Task.css';
import {
  addTaskFormToHierarchy,
  removeTaskFormFromHierarchy,
  startSuggestions,
  showTaskDetails,
  toggleRightPanel
} from '../../../../actions';

class RawTask extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChildren: true,
      showAssigneeInput: false
    };
  }

  toggleChildren = () => {
    this.setState({
      ...this.state,
      showChildren: !this.state.showChildren
    });
  }

  toggleNewForm = () => {
    const {
      taskData,
      addTaskFormToHierarchy,
      removeTaskFormFromHierarchy
    } = this.props;

    if (!taskData.subtaskform_id) {
      addTaskFormToHierarchy(taskData.gid, generateId('task'));
    } else {
      removeTaskFormFromHierarchy(taskData.gid, taskData.subtaskform_id);
    }
  }

  redirectToDiscuss = () => {
    const { history, taskData, match: { params: { pursuanceId } } } = this.props;
    history.push({
      pathname: `/pursuance/${pursuanceId}/discuss/task/${taskData.gid}`
    });
  }

  styleUl = () => {
    if (this.state.showChildren) {
      return { display: 'block' };
    } else {
      return { display: 'none' };
    }
  }

  mapSubTasks = (task) => {
    const { pursuances, autoComplete, taskMap, taskForm } = this.props;
    return task.subtask_gids.map((gid) => {
      return (
          <Task
            key={gid}
            taskData={taskMap[gid]}
            taskMap={taskMap}
            pursuances={pursuances}
            autoComplete={autoComplete}
            taskForm={taskForm}
          />
      )
    });
  }

  getTaskIcon = (task, showChildren) => {
    if (task.subtask_gids.length < 1) {
      return (
        <div className="toggle-icon-ctn-disable" />
      );
    } else if (showChildren) {
      return (
        <div className="toggle-icon-ctn" onClick={this.toggleChildren}>
          <TiMinus className="minus-icon" />
        </div>
      );
    } else {
      return (
        <div className="toggle-icon-ctn" onClick={this.toggleChildren}>
          <TiPlus className="plus-icon" />
        </div>
      );
    }
  }

  showAssigneeInput = () => {
    this.setState({
      showAssigneeInput: true
    });
  }

  hideEditAssignee = () => {
    this.setState({
      showAssigneeInput: false
    });
  }

  onFocus = (e) => {
    const { users, pursuances, startSuggestions, currentPursuanceId, taskData } = this.props;
    const suggestions = Object.assign({}, pursuances, users);
    delete suggestions[currentPursuanceId];
    startSuggestions(e.target.value, filterSuggestion, suggestions, taskData.gid);
  }

  getStatusClassName = (task) => {
    const status = task.status || "New";
    return ("task-title-status-" + status);
  }

  showTitle = (task) => {
    const statusClassName = this.getStatusClassName(task);

    if (task.parent_task_gid) {
      return (
        <div className={statusClassName}>{task.title}</div>
      );
    }
    // Bold top-level tasks
    return (
      <div className={statusClassName}>
        <strong>{task.title}</strong>
      </div>
    );
  }

  getTooltip = (icon) => {
    if (icon === 'hands-down') {
      return (
        <Tooltip id="tooltip-hands-down">
          <strong>Create Subtask</strong>
        </Tooltip>
      );
    } else if (icon === 'chat') {
      return (
        <Tooltip id="tooltip-chat">
          <strong>Discuss Task</strong>
        </Tooltip>
      );
    }
  }

  getAssignedCss = (task) => {
    const { user } = this.props;
    if (task.assigned_to && task.assigned_to === user.username) {
      return " assigned-to-me";
    } else {
      return "";
    }
  }

  selectTaskInHierarchy = () => {
    const {
      taskData,
      rightPanel,
      showTaskDetails,
      toggleRightPanel
    } = this.props;

    if (rightPanel.show && rightPanel.tab === 'TaskDetails' && rightPanel.taskGid === taskData.gid) {
      toggleRightPanel();
      return;
    }
    showTaskDetails({taskGid: taskData.gid});
  }


  render() {
    const { pursuances, taskData, autoComplete, currentPursuanceId } = this.props;
    const { showChildren, showAssigneeInput } = this.state;
    const task = taskData;
    const assignedPursuanceId = task.assigned_to_pursuance_id;
    const assignedByThisPursuance = assignedPursuanceId === currentPursuanceId;
    let placeholder = "";
    let assignedTo;
    if (assignedPursuanceId && !assignedByThisPursuance && pursuances[assignedPursuanceId]) {
        placeholder = pursuances[assignedPursuanceId].suggestionName;
        assignedTo = pursuances[assignedPursuanceId].id;
    }
    else if (task.assigned_to) {
        placeholder = '@' + task.assigned_to;
        assignedTo = task.assigned_to;
    }

    return (
      <li className="li-task-ctn">
        <div className="task-ctn">
          <div className="toggle-ctn">
            {this.getTaskIcon(task, showChildren)}
          </div>
          <div className="task-row-ctn">
            <div className="task-title" onClick={this.selectTaskInHierarchy}>
              {this.showTitle(task)}
            </div>
            <div className="task-title-buffer" onClick={this.selectTaskInHierarchy}>
            </div>
            <div className="task-icons-ctn">
              <OverlayTrigger
                placement="bottom"
                overlay={this.getTooltip('hands-down')}>
                <div id={'create-subtask-' + task.gid} className="icon-ctn create-subtask" onClick={this.toggleNewForm}>
                  <TiFlowChildren size={20} />
                </div>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={this.getTooltip('chat')}>
                <div id={'discuss-task-' + task.gid} className="icon-ctn discuss-task" onClick={this.redirectToDiscuss}>
                  <FaCommentsO size={20} />
                </div>
              </OverlayTrigger>
            </div>
            <TaskStatus
              status={task.status}
            />
            <div className="task-assigned-to">
                {
                  showAssigneeInput &&
                   <div className="assign-autocomplete-ctn">
                     {
                       autoComplete.suggestions
                       &&
                       task.gid === autoComplete.suggestionForm
                       &&
                       <AssignerSuggestions
                         suggestionForm={task.gid}
                         editMode={true}
                         hideEditAssignee={this.hideEditAssignee}
                       />
                     }
                    <AssignerInput
                      formId={task.gid}
                      editMode={true}
                      hideEditAssignee={this.hideEditAssignee}
                      placeholder={placeholder}
                      assignedTo={assignedTo}
                    />
                  </div>
                  ||
                  (assignedPursuanceId && pursuances[assignedPursuanceId] && pursuances[assignedPursuanceId].suggestionName)
                    &&
                    <button onClick={this.showAssigneeInput} className={"assignee-button" + this.getAssignedCss(task)}>{pursuances[assignedPursuanceId].suggestionName}</button>
                  ||
                  (task.assigned_to && '@' + task.assigned_to)
                    &&
                    <button onClick={this.showAssigneeInput} className={"assignee-button" + this.getAssignedCss(task)}>{'@' + task.assigned_to}</button>
                  ||
                  <button className="edit-assignee-button" onClick={this.showAssigneeInput}>Assign</button>
                }
            </div>
            <div className="task-due-date">
              {task.due_date && postgrest.formatDate(task.due_date)}
            </div>
          </div>
        </div>
        {
          task.subtask_gids && task.subtask_gids.length > 0 &&
            <ul className="ul-ctn" style={this.styleUl()}>
              {this.mapSubTasks(task)}
            </ul>
        }
        {task.subtaskform_id && <TaskForm
                                  parentGid={task.gid}
                                  id={task.subtaskform_id} />}
      </li>
    );
  }
}

const Task = withRouter(connect(
  ({ pursuances, user, users, currentPursuanceId, autoComplete, rightPanel }) =>
   ({ pursuances, user, users, currentPursuanceId, autoComplete, rightPanel }), {
  addTaskFormToHierarchy,
  removeTaskFormFromHierarchy,
  startSuggestions,
  showTaskDetails,
  toggleRightPanel
})(RawTask));

// Why RawTask _and_ Task? Because Task.mapSubTasks() recursively
// renders Task components which weren't wrapped in a Redux connect()
// call (until calling the original component 'RawTask' and the
// wrapped component 'Task'), and thus `this.props` wasn't being
// populated by Redux within mapSubTasks(). More info:
// https://stackoverflow.com/a/37081592/197160
export default Task;
