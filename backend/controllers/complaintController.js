const User = require("../models/userModel");
const ErrorResponse = require("../utils/errorResponse");
const Hostel = require("../models/hostel");
const Complaint = require("../models/complaintModel");
const Comment = require("../models/comment");

exports.raiseComplaint = async (req, res, next) => {
  const Issue = req.body.issue;
  const UserId = req.body._id;
  const UserName = req.body.userName;
  const HostelName = req.body.hostelName;
  console.log(req.body);
  // console.log(req.query);
  try {
    const complaint = await Complaint.create({
      issue: Issue,
      userId: UserId,
      userName: UserName,
      hostelName: HostelName,
    });
    console.log(complaint);
    await Hostel.findOneAndUpdate(
      { Name: HostelName },
      {
        $push: { complaints: complaint._id },
      }
    );

    await User.findByIdAndUpdate(UserId, {
      $push: { complaint: complaint._id },
    });

    res.status(201).json({
      success: true,
      complaint: complaint,
    });
  } catch (error) {
    next(error);
  }
};

exports.showComplaints = async (req, res, next) => {
  const hostelName = req.params.hostelName;
  try {
    let status = 0;
    console.log(req.query.status);
    if (req.query.status !== undefined) status = req.query.status;
    console.log(status);
    const complaints = await Complaint.find({
      hostelName: hostelName,
      status: status,
    })
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json({ complaints: complaints });
  } catch (error) {
    next(error);
  }
};

exports.showUserComplaints = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId)
      .populate("complaint", [
        "issue",
        "userName",
        "upvotes",
        "downvotes",
        "status",
        "hostelName",
        "comments",
        "user",
      ])
      .exec();
    console.log(user, "......");
    const statusFilter = req.query.status;
    let complaints;
    if (statusFilter === undefined) complaints = user.complaint;
    else
      complaints = user.complaint.filter((obj) => obj.status == statusFilter);

    //////////  pagination
    let { pageIndex = 1, pageSize = 5000 } = req.query;
    let count = complaints.length;
    let firstIndex = pageSize * (pageIndex - 1);
    let lastIndex = pageSize * pageIndex;
    lastIndex = Math.min(count, lastIndex);
    if (lastIndex < firstIndex) firstIndex = 0;

    const complaintData = complaints.slice(firstIndex, lastIndex);

    console.log(complaintData);
    res.status(200).json({ complaints: complaintData });
  } catch (error) {
    next(error);
  }
};

exports.deleteComplaint = async (req, res, next) => {
  const complaintId = req.params.complaintId;
  const complaint = await Complaint.findById(complaintId).exec();

  if (!complaint)
    next(new ErrorResponse("Comment to be deleted not found", 400));

  const hostelName = complaint.hostelName;
  if (String(req.user._id) !== String(complaint.userId))
    next(
      new ErrorResponse("User not authorized to delete this complaint", 400)
    );

  try {
    await Hostel.findOneAndUpdate(
      { Name: complaint.hostelName },
      {
        $pull: { complaints: complaintId },
      }
    );
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { complaint: complaintId },
    });

    await Complaint.findByIdAndDelete(complaintId);
    await Comment.deleteMany({ _id: { $in: complaint.comments } });
    res.status(200).json({ success: true, message: "Deletion successfull" });
  } catch (error) {
    next(error);
  }
};

exports.resolveComplaint = async (req, res, next) => {
  const complaintID = req.params.complaintID;
  try {
    await Complaint.findByIdAndUpdate(complaintID, { status: true }).exec();
    res.status(201).json({ success: true, message: "Complaint resolved" });
  } catch (error) {
    next(error);
  }
};
