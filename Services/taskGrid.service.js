const TaskGridModel = require('../Models/taskGrid.model');
function groupByParent(data) {
  const result = {};

  Object.keys(data).forEach(date => {
    const items = data[date];

    const map = new Map();
    const roots = [];

    // Step 1: clone items and create lookup
    items.forEach(item => {
      map.set(item.utemId, { ...item, children: [] });
    });

    // Step 2: attach children to parent
    map.forEach(item => {
      if (item.parent && map.has(item.parent)) {
        map.get(item.parent).children.push(item);
      } else {
        roots.push(item); // parent = 0
      }
    });

    result[date] = roots;
  });

  return result;
}
const TaskGridService = {
  createTaskGrid: async (payload) => {
    if (!payload.task) throw { status: 400, message: 'task is required' };
    const res = await TaskGridModel.create(payload);
    return { lastInsertId: res.insertId, status: 200 };
  },

  updateTaskGrid: async (taskGridId, payload) => {
    const taskGrid = await TaskGridModel.findById(taskGridId);
    if (!taskGrid) throw { status: 404, message: 'Task grid not found' };
    await TaskGridModel.update(taskGridId, payload);
    return { taskGridId, status: 200 };
  },

  deleteTaskGrid: async (taskGridId) => {
    const taskGrid = await TaskGridModel.findById(taskGridId);
    if (!taskGrid) throw { status: 404, message: 'Task grid not found' };
    await TaskGridModel.delete(taskGridId);
    return { taskGridId, deleted: true };
  },

  getTaskGridById: async (taskGridId) => {
    const taskGrid = await TaskGridModel.findById(taskGridId);
    if (!taskGrid) throw { status: 404, message: 'Task grid not found' };
    return taskGrid;
  },

  getTaskGridsByTask: async (taskId) => {
    const taskGrids = await TaskGridModel.getByTask(taskId);
    const taskMap = new Map();
    if(taskGrids && taskGrids.length > 0)
    {
      taskGrids.forEach((e)=>{
        const currentDate = new Date(e?.date).toISOString().split('T')[0];
        console.log(currentDate);
        
        if(taskMap.has(currentDate))
        {
          const existingData = taskMap.get(currentDate);
          existingData.push(e);
        }else{
          taskMap.set(currentDate,[e]);
        }
      })
    }
    console.log(taskMap)
    const taskGridObject = Object.fromEntries(taskMap);
    taskMap.clear();
    let taskGridObjectNew = groupByParent(taskGridObject)
    for(var x in taskGridObjectNew)
    {
      taskGridObjectNew[x].forEach((e)=>{
        if(e.metadata && taskMap.has(e.metadata))
        {
          const existingData = taskMap.get(e.metadata);
          existingData.push(e);
        }else if(e.metadata && !taskMap.has(e.metadata)){
          taskMap.set(e.metadata,[e]);
        }
      });
      taskGridObjectNew[x] = Object.fromEntries(taskMap);
    }
    return { success: true, taskGrids:taskGridObjectNew, count: taskGrids.length, startDate:taskGrids[0]?.start_date, endDate:taskGrids[0]?.end_date };
  },

  getAllTaskGrids: async (limit = 100, offset = 0) => {
    const taskGrids = await TaskGridModel.getAll(limit, offset);
    return { success: true, taskGrids, count: taskGrids.length };
  },

  updateTaskGridTask: async (taskGridId, taskId) => {
    const taskGrid = await TaskGridModel.findById(taskGridId);
    if (!taskGrid) throw { status: 404, message: 'Task grid not found' };
    await TaskGridModel.updateTask(taskGridId, taskId);
    return { taskGridId, taskId };
  },

  updateTaskGridStartDate: async (taskGridId, startDate) => {
    const taskGrid = await TaskGridModel.findById(taskGridId);
    if (!taskGrid) throw { status: 404, message: 'Task grid not found' };
    await TaskGridModel.updateStartDate(taskGridId, startDate);
    return { taskGridId, startDate };
  },

  updateTaskGridEndDate: async (taskGridId, endDate) => {
    const taskGrid = await TaskGridModel.findById(taskGridId);
    if (!taskGrid) throw { status: 404, message: 'Task grid not found' };
    await TaskGridModel.updateEndDate(taskGridId, endDate);
    return { taskGridId, endDate };
  }
};

module.exports = TaskGridService;
