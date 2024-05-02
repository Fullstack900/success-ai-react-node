import "./Tasks.css";
import { Box, Typography } from "@mui/material";
function Tasks(props) {
  return (
    <div
      className="Tasks"
      key={props.task.id}
      id={props.task.id}
      draggable="true"
      onDragStart={(e) => props.DragStartFunc(e)}
      onDragEnd={(e) => props.DragEndFunc(e)}
    >
      <div className="d-flex justify-content-between align-items-center ">
        <h4>{props.task.title}</h4>
      </div>
      <p>{props.task.email}</p>
      <div className="d-flex align-items-center">
        <div>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              bgcolor: "background.paper",
              borderRadius: 1,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle2">${props.task.amount}</Typography>
            <Typography variant="subtitle2">{props.task.date}</Typography>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default Tasks;
